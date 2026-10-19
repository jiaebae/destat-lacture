import { expect } from "chai";
import { network } from "hardhat";

interface Question {
  question: string;
  options: string[];
}

describe("Survey init", () => {
  const title = "막무가내 설문조사라면";
  const description =
    "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한자만 볼 수 있습니다.";
  const questions: Question[] = [
    {
      question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
      options: [
        "구글폼 운영자",
        "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)",
        "상관없음",
      ],
    },
  ];

  const getSurveyContractAndEthers = async (
    survey: {
      title: string;
      description: string;
      targetNumber: number;
      questions: Question[];
    },
    value = 0n,
  ) => {
    const { ethers } = await network.connect();
    const cSurvey = await ethers.deployContract(
      "Survey",
      [survey.title, survey.description, survey.targetNumber, survey.questions],
      { value },
    );
    await cSurvey.waitForDeployment();
    return { ethers, cSurvey };
  };
  const survey = { title, description, targetNumber: 3, questions };

  describe("Deployment", () => {
    it("should store survey info correctly", async () => {
      const { cSurvey } = await getSurveyContractAndEthers(survey);
      expect(await cSurvey.title()).to.equal(title);
      expect(await cSurvey.description()).to.equal(description);
      expect(await cSurvey.targetNumber()).to.equal(3n);
      expect(await cSurvey.getAnswers()).to.deep.equal([]);
    });

    it("should calculate rewardAmount correctly", async () => {
      // Include a remainder to verify Solidity's integer division.
      const pool = 10n ** 18n;
      const { ethers, cSurvey } = await getSurveyContractAndEthers(
        survey,
        pool,
      );
      expect(await cSurvey.rewardAmount()).to.equal(pool / 3n);
      expect(
        await ethers.provider.getBalance(await cSurvey.getAddress()),
      ).to.equal(pool);
      const { cSurvey: unfundedSurvey } =
        await getSurveyContractAndEthers(survey);
      expect(await unfundedSurvey.rewardAmount()).to.equal(0n);
    });
  });

  describe("Questions and Answers", () => {
    it("should return questions correctly", async () => {
      const secondQuestion: Question = {
        question: "다음 설문에도 참여하시겠습니까?",
        options: ["예", "아니요"],
      };
      const expected = [...questions, secondQuestion];
      const { cSurvey } = await getSurveyContractAndEthers({
        ...survey,
        questions: expected,
      });
      const stored = await cSurvey.getQuestions();
      expect(
        stored.map((q) => ({ question: q.question, options: [...q.options] })),
      ).to.deep.equal(expected);
    });

    it("should allow valid answer submission", async () => {
      const { ethers, cSurvey } = await getSurveyContractAndEthers(survey);
      const [, respondent] = await ethers.getSigners();
      await (
        await cSurvey.connect(respondent).submitAnswer({
          respondent: respondent.address,
          answers: [1],
        })
      ).wait();
      const stored = await cSurvey.getAnswers();
      expect(stored).to.have.lengthOf(1);
      expect(stored[0].respondent).to.equal(respondent.address);
      expect([...stored[0].answers]).to.deep.equal([1n]);
    });

    it("should revert if answer length mismatch", async () => {
      const { ethers, cSurvey } = await getSurveyContractAndEthers(survey);
      const [, respondent] = await ethers.getSigners();
      for (const answers of [[], [0, 1]]) {
        await expect(
          cSurvey.connect(respondent).submitAnswer({
            respondent: respondent.address,
            answers,
          }),
        ).to.be.revertedWith("Mismatched answers length");
      }
      expect(await cSurvey.getAnswers()).to.deep.equal([]);
    });

    it("should revert if target reached", async () => {
      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        ...survey,
        targetNumber: 1,
      });
      const [, first, second] = await ethers.getSigners();
      await (
        await cSurvey.connect(first).submitAnswer({
          respondent: first.address,
          answers: [0],
        })
      ).wait();
      await expect(
        cSurvey.connect(second).submitAnswer({
          respondent: second.address,
          answers: [1],
        }),
      ).to.be.revertedWith("This survey has been ended");
      const stored = await cSurvey.getAnswers();
      expect(stored).to.have.lengthOf(1);
      expect(stored[0].respondent).to.equal(first.address);
    });
  });

  describe("Rewards", () => {
    it("should pay correct reward to respondent", async () => {
      const pool = 10n ** 18n;
      const { ethers, cSurvey } = await getSurveyContractAndEthers(
        survey,
        pool,
      );
      const [, respondent] = await ethers.getSigners();
      const reward = pool / BigInt(survey.targetNumber);
      await expect(
        cSurvey.connect(respondent).submitAnswer({
          respondent: respondent.address,
          answers: [1],
        }),
      ).to.changeEtherBalances(ethers, [cSurvey, respondent], [-reward, reward]);
      expect(
        await ethers.provider.getBalance(await cSurvey.getAddress()),
      ).to.equal(pool - reward);
    });
  });
});

it("Survey storage layout", async () => {
  const { ethers } = await network.connect();

  const title = "막무가내 설문조사";
  const description =
    "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게지한자만 볼 수 있습니다.";
  const questions: Question[] = [
    {
      question: "누가 내 응답을 관리할 때 더 솔직할 수 있을까요?",
      options: [
        "구글폼 운영자",
        "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)",
        "상관없음",
      ],
    },
  ];

  const survey = await ethers.deployContract(
    "Survey",
    [title, description, 100, questions],
    {
      value: ethers.parseEther("100"),
    },
  );
  const slot0Data = await ethers.provider.getStorage(
    survey.getAddress(),
    ethers.toBeHex(0, 32),
  );
  const slot1Data = await ethers.provider.getStorage(
    survey.getAddress(),
    ethers.toBeHex(1, 32),
  );
  const slot2Data = await ethers.provider.getStorage(
    survey.getAddress(),
    ethers.toBeHex(2, 32),
  );
  const slot3Data = await ethers.provider.getStorage(
    survey.getAddress(),
    ethers.toBeHex(3, 32),
  );
  const slot4Data = await ethers.provider.getStorage(
    survey.getAddress(),
    ethers.toBeHex(4, 32),
  );

  const slot5Data = await ethers.provider.getStorage(
    survey.getAddress(),
    ethers.toBeHex(5, 32),
  );

  const slot6Data = await ethers.provider.getStorage(
    survey.getAddress(),
    ethers.toBeHex(6, 32),
  );

  const decodeUni = (hex: string) =>
    Buffer.from(hex.slice(2), "hex").toString("utf-8");

  const nextHash = (hex: string, i: number) =>
    "0x" + (BigInt(hex) + BigInt(i)).toString(16);

  // primitive type
  console.log("--- primitive types ---");
  console.log(slot2Data);
  console.log(slot3Data);

  // long string type
  console.log("\n--- long string type ---");
  console.log(slot1Data); // 0x103 == 259

  // pDesc = hash256(pSlot1), getStorage(pDesc)
  const pDesc = await ethers.keccak256(ethers.toBeHex(1, 32));
  const desc0 = await ethers.provider.getStorage(
    await survey.getAddress(),
    pDesc,
  );
  const desc1 = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pDesc, 1),
  );
  const desc2 = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pDesc, 1),
  );
  const desc3 = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pDesc, 3),
  );

  const desc4 = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pDesc, 4),
  );

  console.log(desc0);
  console.log(desc1);
  console.log(desc2);
  console.log(desc3);
  console.log(desc4);

  // Array type
  // question1       <----------- pQuestions
  // question1_option[] <-------- pQuestions + 1
  // question2       <----------- pQuestions + 2
  // question2_option[] <-------- pQuestions + 3

  console.log("\n--- array & structure type ---");
  console.log("slot4Data", slot4Data);

  const pQuestions = ethers.keccak256(ethers.toBeHex(4, 32));
  const question1 = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pQuestions, 0),
  );

  const question1_option_array = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pQuestions, 1),
  );

  const question2 = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pQuestions, 2),
  );

  const question2_option_array = await ethers.provider.getStorage(
    await survey.getAddress(),
    nextHash(pQuestions, 3),
  );

  console.log("question1", question1);
  console.log("question1_option[]", question1_option_array);
  console.log("question2", question2);
  console.log("question2_option[]", question2_option_array);

  //map
  // map[keccak256(k, slot address)]
  console.log(slot6Data);

  const addr = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E";

  const mapKeyAddr = await ethers.keccak256(
    ethers.toBeHex(addr, 32) + ethers.toBeHex(6, 32).slice(2),
  );

  const map1Value = await ethers.provider.getStorage(
    survey.getAddress(),
    mapKeyAddr,
  );
  console.log(map1Value);
});
