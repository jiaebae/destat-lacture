import { expect } from "chai";
import { network } from "hardhat";

interface Question {
  question: string;
  options: string[];
}

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
