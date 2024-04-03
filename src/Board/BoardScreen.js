import React, { useState } from 'react';
import styled from 'styled-components';
import BoardScreenUI from './BoardScreenUI';

const TabNavigatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 5em;
  width: 60%;
  min-width: 30em;
  background-color: #dfe9f5;
  top: 5em;
  left: 20%;
  position: fixed;
  z-index: 1;
`;

const NavLinkContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px;
  width: 50%;
`;

const StyledLink = styled.button`
  display: flex; // flex 컨테이너 설정
  flex-wrap: wrap; // 컨테이너 너비를 초과하는 경우 줄 바꿈
  justify-content: center; // 가운데 정렬
  gap: 10px; // 요소 간 간격 설정
  background: none;
  border: none;
  text-decoration: none;
  color: #008b8b;
  cursor: pointer;
  margin: 20px;
  font-weight: bold;
  font-size: 1em;
  padding-bottom: 10px;
`;

const QuestionBoard = () => (
  <BoardScreenUI title="질문" boardName="questionBoard" />
);
const StudyTipBoard = () => (
  <BoardScreenUI title="공부 팁" boardName="tipBoard" />
);
const ExamReviewBoard = () => (
  <BoardScreenUI title="시험 후기" boardName="reviewBoard" />
);

const BoardScreen = () => {
  const [currentTab, setCurrentTab] = useState('questionBoard');

  const TabNavigator = ({ setCurrentTab }) => (
    <TabNavigatorContainer>
      <NavLinkContainer>
        <StyledLink
          onClick={() => setCurrentTab('questionBoard')}
          style={{
            borderBottom:
              currentTab === 'questionBoard' ? '2px solid #008b8b' : 'none',
          }}
        >
          질문
        </StyledLink>
        <StyledLink
          onClick={() => setCurrentTab('tipBoard')}
          style={{
            borderBottom:
              currentTab === 'tipBoard' ? '2px solid #008b8b' : 'none',
          }}
        >
          공부 팁
        </StyledLink>
        <StyledLink
          onClick={() => setCurrentTab('reviewBoard')}
          style={{
            borderBottom:
              currentTab === 'reviewBoard' ? '2px solid #008b8b' : 'none',
          }}
        >
          시험 후기
        </StyledLink>
      </NavLinkContainer>
    </TabNavigatorContainer>
  );

  return (
    <>
      <TabNavigator setCurrentTab={setCurrentTab} />
      {currentTab === 'questionBoard' && <QuestionBoard />}
      {currentTab === 'tipBoard' && <StudyTipBoard />}
      {currentTab === 'reviewBoard' && <ExamReviewBoard />}
    </>
  );
};

export default BoardScreen;
