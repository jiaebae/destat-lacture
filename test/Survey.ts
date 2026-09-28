import { expect } from "chai";
import { network } from "hardhat";

interface Question {
  question: string;
  options: string[];
}

it("Survey init", async () => {
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

  const factory = await ethers.deployContract("SurveyFactory", [
    ethers.parseEther("50"),
    ethers.parseEther("0.1"),
  ]);
  const tx = await factory.createSurvey(
    {
      title,
      description,
      targetNumber: 100,
      questions,
    },
    {
      value: ethers.parseEther("100"),
    },
  );

  const receipt = await tx.wait();
  let surveyAddress;
  receipt?.logs.forEach((log) => {
    const event = factory.interface.parseLog(log);
    if (event?.name == "SurveyCreated") {
      surveyAddress = event.args[0];
    }
  });
  // const surveys = await factory.getSurveys();

  const surveyC = await ethers.getContractFactory("Survey");
  const signers = await ethers.getSigners();
  const respondent = signers[0];

  if (surveyAddress) {
    const survey = await surveyC.attach(surveyAddress);
    await survey.connect(respondent);
    await ethers.provider.getBalance(respondent);

    await survey.submitAnswer({
      respondent,
      answers: [1],
    });
  }
});

describe("SurveyFactory Contract", () => {
  async function deployFactory() {
    const { ethers } = await network.connect();

    const factory = await ethers.deployContract("SurveyFactory", [
      ethers.parseEther("50"),
      ethers.parseEther("0.1"),
    ]);
    await factory.waitForDeployment();

    return { ethers, factory };
  }

  let context: Awaited<ReturnType<typeof deployFactory>>;

  beforeEach(async () => {
    context = await deployFactory();
  });

  function makeSurvey(title = "테스트 설문", targetNumber = 100) {
    return {
      title,
      description: "설문 생성 테스트",
      targetNumber,
      questions: [
        {
          question: "좋아하는 색은?",
          options: ["빨강", "파랑"],
        },
      ],
    };
  }

  it("should deploy with correct minimum amounts", async () => {
    const { ethers, factory } = context;

    expect(await factory.min_pool_amount()).to.equal(ethers.parseEther("50"));
    expect(await factory.min_reward_amount()).to.equal(
      ethers.parseEther("0.1"),
    );
  });

  it("should create a new survey when valid values are provided", async () => {
    const { ethers, factory } = context;
    const before = await factory.getSurveys();

    const tx = await factory.createSurvey(makeSurvey(), {
      value: ethers.parseEther("50"),
    });
    await tx.wait();

    const surveys = await factory.getSurveys();

    expect(surveys.length).to.equal(before.length + 1);

    const surveyAddress = surveys[surveys.length - 1];

    await expect(tx).to.emit(factory, "SurveyCreated").withArgs(surveyAddress);

    expect(await ethers.provider.getCode(surveyAddress)).to.not.equal("0x");
  });

  it("should revert if pool amount is too small", async () => {
    const { ethers, factory } = context;

    await expect(
      factory.createSurvey(makeSurvey(), {
        value: ethers.parseEther("49"),
      }),
    ).to.be.revertedWith("insufficient pool amount");

    expect(await factory.getSurveys()).to.have.lengthOf(0);
  });

  it("should revert if reward amount per respondent is too small", async () => {
    const { ethers, factory } = context;

    // 50 ETH / 501명은 최소 보상인 0.1 ETH보다 작습니다.
    await expect(
      factory.createSurvey(makeSurvey("보상 부족 설문", 501), {
        value: ethers.parseEther("50"),
      }),
    ).to.be.revertedWith("insufficient reward amount");

    expect(await factory.getSurveys()).to.have.lengthOf(0);
  });

  it("should store created surveys and return them from getSurveys", async () => {
    const { ethers, factory } = context;

    expect(await factory.getSurveys()).to.have.lengthOf(0);

    const tx1 = await factory.createSurvey(makeSurvey("첫 번째 설문"), {
      value: ethers.parseEther("50"),
    });
    await tx1.wait();

    const firstSurveys = await factory.getSurveys();
    expect(firstSurveys).to.have.lengthOf(1);

    const firstAddress = firstSurveys[0];

    const tx2 = await factory.createSurvey(makeSurvey("두 번째 설문"), {
      value: ethers.parseEther("50"),
    });
    await tx2.wait();

    const surveys = await factory.getSurveys();

    expect(surveys).to.have.lengthOf(2);
    expect(surveys[0]).to.equal(firstAddress);
    expect(surveys[1]).to.not.equal(firstAddress);

    const firstSurvey = await ethers.getContractAt("Survey", surveys[0]);
    const secondSurvey = await ethers.getContractAt("Survey", surveys[1]);

    expect(await firstSurvey.title()).to.equal("첫 번째 설문");
    expect(await secondSurvey.title()).to.equal("두 번째 설문");
  });
});
