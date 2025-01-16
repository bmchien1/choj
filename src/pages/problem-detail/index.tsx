import { useMemo } from "react";
import { Typography, Card, Table } from "antd";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import problemService from "@/apis/service/questionService";

const { Title } = Typography;

const ProblemDetail = () => {
  const { id: problemId } = useParams<{ id: string }>();

  const { data: problemData, error: problemError } = useQuery({
    queryKey: ["problem-detail", problemId],
    queryFn: async ({ queryKey }) => {
      const [, _problemId] = queryKey;
      if (!_problemId) return null;
      return await problemService.getOne(_problemId);
    },
    enabled: !!problemId,
  });

  const testCases = useMemo(() => {
    if (!problemData) return [];
    return problemData?.testCases.map((testCase: any, index: number) => ({
      key: index,
      input: testCase.input,
      expectedOutput: testCase.output,
    }));
  }, [problemData]);

  const testCaseColumns = [
    {
      title: "Input",
      dataIndex: "input",
      key: "input",
      render: (input: string) => {
        return (
          <div className="whitespace-pre-wrap max-w-2xl max-h-40 overflow-auto">
            {input}
          </div>
        );
      },
    },
    {
      title: "Expected Output",
      dataIndex: "expectedOutput",
      key: "expectedOutput",
      render: (expectedOutput: string) => {
        return (
          <div className="whitespace-pre-wrap max-w-2xl max-h-40 overflow-auto">
            {expectedOutput}
          </div>
        );
      },
    },
  ];

  if (problemError) {
    return (
      <div>
        <Title level={2}>Problem not found</Title>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="mb-6">
        <Title level={2}>
          {problemData ? problemData?.problemName : "Problem Title"}
        </Title>
        <div
          className="block mb-4"
          dangerouslySetInnerHTML={{
            __html: problemData
              ? problemData?.problemStatement
              : "Problem Description",
          }}
        />
      </Card>

      {/* Test Cases */}
      <Card title="Test Cases" className="mb-6">
        <Table
          dataSource={testCases}
          columns={testCaseColumns}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ProblemDetail;
