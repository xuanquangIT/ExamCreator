import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f0f4f8;
  font-family: Arial, sans-serif;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #282c34;
  color: #fff;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const ExamList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ExamListItem = styled.li`
  margin: 10px 0;
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  background-color: ${(props) => (props.selected ? '#61dafb' : 'transparent')};
  color: ${(props) => (props.selected ? '#282c34' : '#fff')};
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #61dafb;
    color: #282c34;
  }
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: #61dafb;
  border: none;
  border-radius: 5px;
  color: #282c34;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #21a1f1;
  }
`;

const QuestionContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const OptionButton = styled.button`
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 10px 20px;
  background-color: ${(props) => (props.selected ? '#cfe3ff' : '#f0f0f0')};
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const ResultText = styled.p`
  color: ${(props) => (props.correct ? 'green' : 'red')};
  font-weight: bold;
`;

const PreformattedText = styled.pre`
  white-space: pre-wrap; /* Makes sure the text wraps and newlines are preserved */
  font-family: inherit; /* Uses the same font as the rest of the application */
`;

function App() {
  const [files, setFiles] = useState([]);
  const [exam, setExam] = useState([]);
  const [answers, setAnswers] = useState({});
  const [examList, setExamList] = useState([]);
  const [currentExam, setCurrentExam] = useState('');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = () => {
    const newExams = [];
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const examData = JSON.parse(event.target.result);
        newExams.push({ name: file.name, data: examData });

        if (index === files.length - 1) {
          // Update state only once all files are processed
          setExamList(newExams);
          localStorage.setItem('exams', JSON.stringify(newExams));
          if (newExams.length > 0) {
            setExam(newExams[0].data);
            setCurrentExam(newExams[0].name);
          }
        }
      };
      reader.readAsText(file);
    });
  };

  const loadExam = (filename) => {
    const selectedExam = examList.find(exam => exam.name === filename);
    if (selectedExam) {
      setExam(selectedExam.data);
      setAnswers({});
      setCurrentExam(filename);
    }
  };

  const handleAnswer = (questionIndex, option) => {
    setAnswers({
      ...answers,
      [questionIndex]: option
    });
  };

  const renderResult = (questionIndex) => {
    if (answers[questionIndex] !== undefined) {
      const correctAnswer = exam[questionIndex].answer.trim().toLowerCase();
      const userAnswer = answers[questionIndex].trim().toLowerCase();
      const isCorrect = correctAnswer === userAnswer;
      return (
        <ResultText correct={isCorrect}>
          {isCorrect ? (
            <>
              Correct!
              <br />
              Explanation: {exam[questionIndex].explanation}
            </>
          ) : (
            <>
              Incorrect!
              <br />
              The correct answer is: {exam[questionIndex].answer}
              <br />
              Explanation: {exam[questionIndex].explanation}
            </>
          )}
        </ResultText>
      );
    }
    return null;
  };

  // Load exams from localStorage on component mount
  useEffect(() => {
    const storedExams = JSON.parse(localStorage.getItem('exams')) || [];
    setExamList(storedExams);
    if (storedExams.length > 0) {
      setExam(storedExams[0].data);
      setCurrentExam(storedExams[0].name);
    }
  }, []);

  return (
    <AppContainer>
      <Sidebar>
        <h3>Exams</h3>
        <ExamList>
          {examList.map((exam, index) => (
            <ExamListItem
              key={index}
              onClick={() => loadExam(exam.name)}
              selected={currentExam === exam.name}
            >
              {exam.name}
            </ExamListItem>
          ))}
        </ExamList>
        <input type="file" multiple onChange={handleFileChange} />
        <UploadButton onClick={handleUpload}>Upload and Create Exams</UploadButton>
      </Sidebar>
      <MainContent>
        <h1>{currentExam ? currentExam : 'Upload or Select an Exam'}</h1>
        {exam.length > 0 && (
          <div>
            {exam.map((q, index) => (
              <QuestionContainer key={index}>
                <h3>Question {index + 1}/{exam.length}</h3>
                <PreformattedText>{q.question}</PreformattedText>
                {Object.keys(q.options).map((key) => (
                  <OptionButton
                    key={key}
                    onClick={() => handleAnswer(index, key)}
                    selected={answers[index] === key}
                  >
                    {`${key}) ${q.options[key]}`}
                  </OptionButton>
                ))}
                {renderResult(index)}
              </QuestionContainer>
            ))}
          </div>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
