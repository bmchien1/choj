import { useState } from 'react';
import { Button, Card, Row, Col, Alert, Tab, Nav, Table } from 'react-bootstrap';
import { Input, Select, } from 'antd';
// import {Upload}from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

interface ProblemDetail {
  description: string;
  input: string;
  output: string;
  example: string;
}

const ProblemDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  // const [file, setFile] = useState<File | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);

  // Placeholder data
  const problemDetail: ProblemDetail = {
    description: "Solve the problem by implementing the function.",
    input: "Input details here",
    output: "Expected output format here",
    example: "Example usage of the function",
  };

  const handleSubmitCode = () => {
    // Logic for submitting code (API call to backend)
    const submission = { id: submissionHistory.length + 1, status: 'Pending', time: new Date().toLocaleString() };
    setSubmissionHistory([...submissionHistory, submission]);
  };

  // const columns = [
  //   { title: 'Submission ID', dataIndex: 'id', key: 'id' },
  //   { title: 'Status', dataIndex: 'status', key: 'status' },
  //   { title: 'Time', dataIndex: 'time', key: 'time' },
  // ];

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Body>
        <h3 className="mb-4">Problem Details - Problem {id}</h3>

        <Row className="mb-3">
          <Col sm={12} md={6}>
            <h5>Description</h5>
            <p>{problemDetail.description}</p>
          </Col>
          <Col sm={12} md={6}>
            <h5>Input</h5>
            <p>{problemDetail.input}</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col sm={12} md={6}>
            <h5>Output</h5>
            <p>{problemDetail.output}</p>
          </Col>
          <Col sm={12} md={6}>
            <h5>Example</h5>
            <p>{problemDetail.example}</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col sm={12} md={6}>
            <h5>Choose Language</h5>
            <Select value={language} onChange={(value: string) => setLanguage(value)} style={{ width: '100%' }}>
              <Option value="javascript">JavaScript</Option>
              <Option value="python">Python</Option>
              <Option value="java">Java</Option>
              {/* Add more languages as needed */}
            </Select>
          </Col>
        </Row>

        <Tab.Container defaultActiveKey="codeEditor">
          <Row className="mb-3">
            <Col sm={12}>
              <Nav variant="tabs" className="justify-content-start">
                <Nav.Item>
                  <Nav.Link eventKey="codeEditor">Code Editor</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fileUpload">Upload File</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={12}>
              <Tab.Content>
                <Tab.Pane eventKey="codeEditor">
                  <TextArea
                    rows={10}
                    placeholder="Write your code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-100"
                  />
                </Tab.Pane>
                {/* <Tab.Pane eventKey="fileUpload">
                  <Upload 
                    beforeUpload={(file) => { setFile(file); return false; }}
                    className="w-100"
                  >
                    <Button variant="outline-secondary" className="w-100">
                      <UploadOutlined /> Choose File
                    </Button>
                  </Upload>
                </Tab.Pane> */}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

        <Row className="mt-3">
          <Col sm={12}>
            <Button variant="primary" onClick={handleSubmitCode} className="w-100">
              Submit Code
            </Button>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col sm={12}>
            <h5>Submission History</h5>
            {submissionHistory.length === 0 && (
              <Alert variant="info">
                No submissions yet.
              </Alert>
            )}
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {submissionHistory.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.id}</td>
                    <td>{submission.status}</td>
                    <td>{submission.time}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProblemDetailsPage;
