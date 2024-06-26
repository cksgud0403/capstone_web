import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { HashLoader } from 'react-spinners';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { Button } from 'antd';
import Modal from 'react-modal';
import UnsolvedScreen from './UnsolvedScreen';
import { MediaSideBar } from '../Problem/SideBar';
import { CloseOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { Box } from '@mui/material';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 5em);
  width: 60vw;
  min-width: 800px;
  right: 5vw;
  background-color: ${(props) => (props.isIncorrect ? '#db4455' : '#bbd2ec')};
  position: relative;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px;
  width: 95%;
  position: absolute;
  top: 1em;
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  padding: 1em;
  border-radius: 1em;
  background-color: white;
  font-weight: 600;
`;

const Score = styled.div`
  display: flex;
  align-items: center;
  padding: 1em;
  border-radius: 1em;
  background-color: white;
  font-weight: 600;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 5em;
  min-width: 800px;
`;

const Guess = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 5em;
  margin-bottom: 5%;
`;
const Explanation = styled.div`
  display: flex;
  padding: 3em;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  min-width: 25em;
`;
const Keypad = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const KeyButton = styled.button`
  margin: 0.7em;
  padding: 0.2em;
  width: 15vw;
  height: 5vh;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1.3em;

  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0px 0px 0px 0px #838abd;
  &:hover {
    box-shadow: 0px 0px 0px 5px #838abd;
  }
`;
const Line = styled.div`
  display: flex;
  background-color: #7bb4e3;
  height: 10px;
  margin: 10px;
  border-radius: 20px;
`;
const FixedButton = styled(FloatButton)`
  position: absolute;
  right: 50px;
  top: 40px;
`;

const QuizGame = () => {
  const [keywords, setKeywords] = useState([]); // 퀴즈 문제 리스트
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [currentKeyword, setCurrentKeyword] = useState(); // 현재 문제
  const [keypadKeywords, setKeypadKeywords] = useState([]); // 키패드 랜덤 글자 리스트
  const [guess, setGuess] = useState(''); // 사용자 답 추측 문자열
  const [guessCount, setGuessCount] = useState(0); // guess의 글자 수
  const [currentIndex, setCurrentIndex] = useState(0); // 랜덤 문제 인덱스 리스트의 현재 인덱스
  const [randomIndexList, setRandomIndexList] = useState([]); // 랜덤 문제 인덱스 리스트
  const [timer, setTimer] = useState(5); // 타이머. 2분 제한
  const countdownRef = useRef(null); // 타이머 id를 저장할 ref
  const [score, setScore] = useState(0); // 스코어
  const navigate = useNavigate();
  const [selectedButtons, setSelectedButtons] = useState(
    // 15개의 키패드 선택 여부 상태
    new Array(15).fill(false)
  );
  const [unsolved, setUnsolved] = useState([]); // 넘긴 문제 저장
  const [solveCount, setSolveCount] = useState(0); // 문제 수 카운트
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 오픈 여부
  const [isIncorrect, setIsIncorrect] = useState(false); // 오답 시 깜빡거리는 효과에 사용

  // 키워드 가져오기
  useEffect(() => {
    const fetchExamRounds = async () => {
      try {
        setIsLoading(true);
        const list = [];
        const keywordCollection = collection(firestore, 'keyword');
        const keywordSnapshot = await getDocs(keywordCollection);
        keywordSnapshot.forEach((doc) => {
          list.push({ data: doc.data() });
        });
        setKeywords(list);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data: ', err);
        setIsLoading(false);
      }
    };
    fetchExamRounds();
  }, []);

  // 문제 만들기를 위한 랜덤 인덱스 생성
  const fillRandomArray = (length) => {
    let randomList = Array.from({ length }, (_, i) => i);
    for (let i = randomList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomList[i], randomList[j]] = [randomList[j], randomList[i]];
    }
    return randomList;
  };

  // 처음 문제 뽑기
  useEffect(() => {
    const randomList = fillRandomArray(keywords.length);
    setRandomIndexList(randomList); // 상태 업데이트
    setCurrentKeyword(keywords[randomList[currentIndex]]);
  }, [keywords]);

  // 현재 키워드, 키패드 세팅
  // 3. 문제 업데이트 시 키패드 업데이트
  useEffect(() => {
    if (currentKeyword) {
      setGuess(
        new Array(currentKeyword.data.keyword.length).fill('□').join('')
      );

      // 랜덤 키워드 5개 뽑기
      let selectedKeywords = [...keywords]
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

      // currentKeyword를 제외
      selectedKeywords = selectedKeywords.filter(
        (keyword) => keyword.data.keyword !== currentKeyword.data.keyword
      );

      let charArray = selectedKeywords.flatMap((keyword) =>
        keyword.data.keyword.split('')
      );

      // 현재 키워드의 문자열을 제외한 문자 개수만큼만 뽑기
      const remainingCount = 15 - currentKeyword.data.keyword.length;
      charArray = charArray.slice(0, remainingCount);

      // 현재 키워드의 문자열을 charArray에 추가
      charArray = charArray.concat(currentKeyword.data.keyword.split(''));

      // 문자 배열을 랜덤으로 섞음
      for (let i = charArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [charArray[i], charArray[j]] = [charArray[j], charArray[i]];
      }
      setKeypadKeywords(charArray);
    }
  }, [currentKeyword]);

  // 2. 문제 인덱스 변경 시 문제 업데이트
  useEffect(() => {
    if (currentIndex < keywords.length) {
      setCurrentKeyword(keywords[randomIndexList[currentIndex]]);
    }
  }, [currentIndex]);

  // 답 검사
  useEffect(() => {
    // 글자 수가 모두 채워졌을 때
    if (guessCount === currentKeyword?.data.keyword.length) {
      // 정답인 경우
      if (guess == currentKeyword.data.keyword) {
        // 다음 문제 세팅
        // 1. 현재 문제 인덱스 변경
        setCurrentIndex(currentIndex + 1);
        setScore(score + 1); // 스코어 추가
        setSolveCount(solveCount + 1); // 문제 수 카운트
      } else {
        console.log('test');
        // 정답이 아닌 경우
        setIsIncorrect(true);
        setTimeout(() => setIsIncorrect(false), 100); // 첫 번째 깜빡임
        setTimeout(() => setIsIncorrect(true), 200); // 두 번째 깜빡임
        setTimeout(() => setIsIncorrect(false), 300); // 원래 색으로 돌아오기
      }
      // guess 초기화
      setGuess(
        new Array(currentKeyword.data.keyword.length).fill('□').join('')
      );
      setGuessCount(0); // 선택 글자 수 초기화
      setSelectedButtons(new Array(15).fill(false)); // 키패드 선택 초기화
    }
  }, [guessCount]);

  // 문제 소진 시 알림창
  useEffect(() => {
    if (solveCount !== 0 && solveCount === keywords.length) {
      setSolveCount(0);
      stopTimer();

      const buttons = {
        // '나가기' 버튼은 항상 표시되도록 수정
        cancel: '나가기',
      };

      // '넘긴 문제 보기' 버튼은 unsolved.length > 0인 경우에만 추가
      if (unsolved.length > 0) {
        buttons.catch = {
          text: '넘긴 문제 보기',
          value: 'catch',
        };
      }

      swal({
        title: '문제가 소진되었습니다.',
        text: '최종 점수: ' + score,
        icon: 'info',
        buttons: buttons,
        dangerMode: true,
        closeOnClickOutside: false,
      }).then((value) => {
        switch (value) {
          case 'catch':
            setIsModalOpen(true); // 모달창 열기
            break;

          default:
            navigate('/');
        }
      });
    }
  }, [solveCount, unsolved]);

  // 타이머 시작
  useEffect(() => {
    setTimer(5); // 타이머 초기화

    // 타이머 시작
    countdownRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) return prevTimer - 1;
        clearInterval(countdownRef.current); // 타이머가 0이 되면 자동으로 정지
        return 0; // 타이머가 0이 되면 상태를 0으로 설정
      });
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(countdownRef.current);
  }, []);

  // 타이머 중지 함수
  const stopTimer = () => {
    clearInterval(countdownRef.current);
  };

  // 타임 오버 시 게임 종료 처리
  useEffect(() => {
    if (timer === 0) {
      stopTimer();
      // 타임 오버 및 점수 알림

      const buttons = {
        // '나가기' 버튼은 항상 표시되도록 수정
        cancel: '나가기',
      };

      // '넘긴 문제 보기' 버튼은 unsolved.length > 0인 경우에만 추가
      if (unsolved.length > 0) {
        buttons.catch = {
          text: '넘긴 문제 보기',
          value: 'catch',
        };
      }

      swal({
        title: '타임 오버!',
        text: '최종 점수: ' + score,
        icon: 'info',
        buttons: buttons,
        dangerMode: true,
        closeOnClickOutside: false,
      }).then((value) => {
        switch (value) {
          case 'catch':
            setIsModalOpen(true); // 모달창 열기
            break;

          default:
            navigate('/');
        }
      });
    }
  }, [timer, unsolved]);

  // 키패드 클릭 시 화면 반영
  const handleSelect = (char, index) => {
    if (
      guessCount < currentKeyword?.data.keyword.length &&
      !selectedButtons[index]
    ) {
      // 선택된 버튼의 상태를 업데이트
      const newSelectedButtons = [...selectedButtons];
      newSelectedButtons[index] = true;
      setSelectedButtons(newSelectedButtons);

      setGuess((prevGuess) => prevGuess.replace('□', char));
      setGuessCount(guessCount + 1);
    }
  };

  // 넘기기 버튼 클릭 시
  const handleNextButton = () => {
    // 현재 문제를 미해결 문제 리스트에 추가
    setUnsolved((prevUnsolved) => [...prevUnsolved, keywords[currentIndex]]);
    // 다음 문제로 이동
    setCurrentIndex(currentIndex + 1);
    // guess 초기화
    setGuess(new Array(currentKeyword.data.keyword.length).fill('□').join(''));
    setGuessCount(0); // 선택 글자 수 초기화
    setSelectedButtons(new Array(15).fill(false)); // 키패드 선택 초기화
    setSolveCount(solveCount + 1); // 문제 수 카운트
  };

  // 키패드 배치
  const buttons = Array.from({ length: 3 }, (_, i) => (
    <div key={i} style={{ flexDirection: 'row' }}>
      {Array.from({ length: 5 }, (_, j) => {
        const index = i * 5 + j;
        return (
          <KeyButton
            key={index}
            style={
              selectedButtons[index]
                ? { backgroundColor: '#7bb4e3' }
                : { backgroundColor: '#dfe9f5' }
            }
            onClick={() => handleSelect(keypadKeywords[index], index)}
          >
            {keypadKeywords[index]}
          </KeyButton>
        );
      })}
    </div>
  ));

  // 모달에서 나가기 버튼 누른 경우 알림창
  const showAlert = () => {
    console.log('test');
    swal({
      title: '정말로 나가시겠습니까?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      closeOnClickOutside: false,
    }).then((willContinue) => {
      if (willContinue) {
        navigate('/');
      }
    });
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'row' }}>
      <MediaSideBar />
      <Container isIncorrect={isIncorrect}>
        {isLoading ? (
          <HashLoader />
        ) : (
          <>
            <TopBar>
              <Timer>
                <span
                  style={timer <= 10 ? { color: 'red' } : { color: 'black' }}
                >
                  {timer > 60
                    ? `남은 시간: ${Math.floor(timer / 60)}분 ${timer % 60}초`
                    : `남은 시간: ${timer}초`}
                </span>
              </Timer>
              <Score>
                <span>점수: {score}</span>
              </Score>
            </TopBar>

            <BodyContainer>
              <Button
                type="primary"
                danger
                onClick={() => handleNextButton()}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  right: '2.5%',
                  top: '30px',
                  fontWeight: '600',
                }}
              >
                문제 넘기기
              </Button>
              <Guess>
                <span style={{ fontSize: '2em' }}>{guess}</span>
              </Guess>
              <Line />
              <Explanation>
                <span
                  style={{
                    fontSize:
                      currentKeyword?.data.explanation?.length > 70
                        ? '1.1em'
                        : '1.3em',
                  }}
                >
                  {currentKeyword?.data.explanation}
                </span>
              </Explanation>
              <Line />
              <Keypad>{buttons}</Keypad>
            </BodyContainer>
            <Modal
              isOpen={isModalOpen}
              onRequestClose={() => setIsModalOpen(false)}
              contentLabel="넘긴 문제 정답"
              shouldCloseOnOverlayClick={false}
              style={{
                content: {
                  top: '50%',
                  left: '50%',
                  right: 'auto',
                  bottom: 'auto',
                  marginRight: '-50%',
                  transform: 'translate(-50%, -50%)',
                  width: '40%',
                  height: '60%',

                  borderRadius: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)', // 그림자 효과 추가
                  display: 'flex', // flex 레이아웃 사용
                  flexDirection: 'column',
                },
              }}
            >
              <FixedButton icon={<CloseOutlined />} onClick={showAlert}>
                나가기
              </FixedButton>
              <div style={{ overflowY: 'auto' }}>
                <UnsolvedScreen unsolved={unsolved} />
              </div>
            </Modal>
          </>
        )}
      </Container>
    </Box>
  );
};
export default QuizGame;
