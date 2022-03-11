import React, { useState, useEffect } from "react";
import "./App.css";
import Keyboard from "./components/Keyboard";
import { wordList } from "./constants/data";

const App = () => {
  const [boardData, setBoardData] = useState(
    JSON.parse(localStorage.getItem("board-data"))
  );
  /* boardDdata 상태를 관리할 수 있는 useState
    로컬스토리지에 있는 board-data의 value를 가져와 JSON.parse() 함수를 통해 객체 값으로 변경한다.
  */

  const [message, setMessage] = useState(null); // 특정 이벤트 상황에 쓰일 message 상태 관리
  const [error, setError] = useState(false); // 특정 에러 상황에 쓰일 error 상태 관리
  const [charArray, setCharArray] = useState([]); // 알파벳 배열 상태 관리

  // 리셋
  const resetBoard = () => {
    var alphabetIndex = Math.floor(Math.random() * 26);
    // alphabetIndex 설정. 0~ 25 까지
    // Math.floor() 함수는 소수점 이하를 버림 한다.

    var wordIndex = Math.floor(
      Math.random() * wordList[String.fromCharCode(97 + alphabetIndex)].length
    );
    // 랜덤으로 생성된 알파벳 인덱스를 통해 아스키코드 97(a) ~ 122(z)까지 중 하나의 알파벳이 결정되고,
    // wordList 내 해당 알파벳으로 시작하는 단어의 길이를 가져와 0~(length -1) 까지의 난수를 생성한다.
    // 난수는 wordIndex로 설정된다.

    let newBoardData = {
      ...boardData,
      solution: wordList[String.fromCharCode(97 + alphabetIndex)][wordIndex], // 정답 단어 설정
      rowIndex: 0, // 행 인덱스
      boardWords: [], // 보드 단어
      boardRowStatus: [], // 보드 행의 상태
      presentCharArray: [], // 활성화 된 알파벳의 배열
      absentCharArray: [], // 빠진 알파벳의 배열
      correctCharArray: [], // 정확히 맞춘 알파벳의 배열
      status: "IN_PROGRESS", // 게임 진행 상태 "진행 중"
    };
    setBoardData(newBoardData); // boardData의 상태값을 newBoardData로 변경
    localStorage.setItem("board-data", JSON.stringify(newBoardData));
    // 로컬스토리지에 "board-data"라는 key의 value를 JSON 문자열로 변환한 newBoardData 객체로 설정
  };

  useEffect(() => {
    if (!boardData || !boardData.solution) {
      // 브라우저가 실행 될 때
      // boardData가 없거나 boardData.solution(정답 단어) 가 없는 경우
      // newBoardDdata를 생성해 boardData로 넣어줌
      var alphabetIndex = Math.floor(Math.random() * 26);
      var wordIndex = Math.floor(
        Math.random() * wordList[String.fromCharCode(97 + alphabetIndex)].length
      );
      let newBoardData = {
        ...boardData,
        solution: wordList[String.fromCharCode(97 + alphabetIndex)][wordIndex],
        rowIndex: 0,
        boardWords: [],
        boardRowStatus: [],
        presentCharArray: [],
        absentCharArray: [],
        correctCharArray: [],
        status: "IN_PROGRESS",
      };
      setBoardData(newBoardData);
      localStorage.setItem("board-data", JSON.stringify(newBoardData));
    }
  }, []);

  // 이벤트 메세지 생성 조종
  const handleMessage = (message) => {
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // 에러 생성 조종
  const handleError = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
    }, 2000);
  };

  // 단어 입력 확인
  const enterBoardWord = (word) => {
    let boardWords = boardData.boardWords;
    let boardRowStatus = boardData.boardRowStatus;
    let solution = boardData.solution;
    let presentCharArray = boardData.presentCharArray;
    let absentCharArray = boardData.absentCharArray;
    let correctCharArray = boardData.correctCharArray;
    let rowIndex = boardData.rowIndex;
    let rowStatus = []; // 보드 행의 상태를 빈 배열로 설정
    let matchCount = 0; // 매치 횟수 0 설정
    let status = boardData.status;

    for (var index = 0; index < word.length; index++) {
      // index는 0부터 단어의 길이 까지 +1씩 상승
      if (solution.charAt(index) === word.charAt(index)) {
        // 만일 정답단어의 index번째 알파벳이 입력한 word의 index번째 알파벳과 일치할 경우
        matchCount++; // 매치 횟수를 1증가 시킴
        rowStatus.push("correct"); // "correct"를 push()로 rowStatus 배열 마지막에 넣어줌
        if (!correctCharArray.includes(word.charAt(index)))
          // 만약 correctCharArray에 word.charAt(index)가 포함되어 있지 않다면
          correctCharArray.push(word.charAt(index));
        // correctCharArray에 해당 알파벳을 push한다.
        if (presentCharArray.indexOf(word.charAt(index)) !== -1)
          // indexOf는 호출한 객체에서 주어진 값과 일치하는 첫번째 인덱스를 반환. 일치하는 값이 없으면 -1을 반환함
          // 만약 presentCharArray 내에 word.charAt(index) 값과 일치하는 첫 번째 인덱스가 있다면
          presentCharArray.splice(
            presentCharArray.indexOf(word.charAt(index)),
            1
          );
        // presentCharArray 내의 일치하는 첫 번째 인덱스 알파벳을 삭제한다.
      } else if (solution.includes(word.charAt(index))) {
        rowStatus.push("present");
        if (
          !correctCharArray.includes(word.charAt(index)) &&
          !presentCharArray.includes(word.charAt(index))
        )
          presentCharArray.push(word.charAt(index));
      } else {
        rowStatus.push("absent");
        if (!absentCharArray.includes(word.charAt(index)))
          absentCharArray.push(word.charAt(index));
      }
    }
    if (matchCount === 5) {
      status = "WIN";
      handleMessage("YOU WON");
    } else if (rowIndex + 1 === 6) {
      status = "LOST";
      handleMessage(boardData.solution);
    }
    boardRowStatus.push(rowStatus);
    boardWords[rowIndex] = word;
    let newBoardData = {
      ...boardData,
      boardWords: boardWords,
      boardRowStatus: boardRowStatus,
      rowIndex: rowIndex + 1,
      status: status,
      presentCharArray: presentCharArray,
      absentCharArray: absentCharArray,
      correctCharArray: correctCharArray,
    };
    setBoardData(newBoardData);
    localStorage.setItem("board-data", JSON.stringify(newBoardData));
  };

  const enterCurrentText = (word) => {
    let boardWords = boardData.boardWords;
    let rowIndex = boardData.rowIndex;
    boardWords[rowIndex] = word;
    let newBoardData = { ...boardData, boardWords: boardWords };
    setBoardData(newBoardData);
  };

  const handleKeyPress = (key) => {
    if (boardData.rowIndex > 5 || boardData.status === "WIN") return;
    if (key === "ENTER") {
      if (charArray.length === 5) {
        let word = charArray.join("").toLowerCase();
        if (!wordList[word.charAt(0)].includes(word)) {
          handleError();
          handleMessage("Not in word list");
          return;
        }
        enterBoardWord(word);
        setCharArray([]);
      } else {
        handleMessage("Not enough letters");
      }
      return;
    }
    if (key === "⌫") {
      charArray.splice(charArray.length - 1, 1);
      setCharArray([...charArray]);
    } else if (charArray.length < 5) {
      charArray.push(key);
      setCharArray([...charArray]);
    }
    enterCurrentText(charArray.join("").toLowerCase());
  };

  return (
    <div className="container">
      <div className="top">
        <div className="title">WORDLE CLONE</div>
        <button className="reset-board" onClick={resetBoard}>
          {"\u27f3"}
        </button>
      </div>
      {message && <div className="message">{message}</div>}
      <div className="cube">
        {[0, 1, 2, 3, 4, 5].map((row, rowIndex) => (
          <div
            className={`cube-row ${
              boardData && row === boardData.rowIndex && error && "error"
            }`}
            key={rowIndex}
          >
            {[0, 1, 2, 3, 4].map((column, letterIndex) => (
              <div
                key={letterIndex}
                className={`letter ${
                  boardData && boardData.boardRowStatus[row]
                    ? boardData.boardRowStatus[row][column]
                    : ""
                }`}
              >
                {boardData &&
                  boardData.boardWords[row] &&
                  boardData.boardWords[row][column]}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="bottom">
        <Keyboard boardData={boardData} handleKeyPress={handleKeyPress} />
      </div>
    </div>
  );
};

export default App;
