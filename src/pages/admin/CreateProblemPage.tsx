import { useState } from "react";
import { Button, Form, Input, Select, message, InputNumber } from "antd";
import problemService from "@/apis/service/adminProblemService";

const { TextArea } = Input;

const CreateProblemPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        tags: values.tags.split(",").map((tag: string) => tag.trim()),
        inputs: values.inputs.split("\n"),
        outputs: values.outputs.split("\n"),
      };
      console.log(formattedValues);
      await problemService.createProblem(formattedValues);

      message.success("Problem created successfully!");
      form.resetFields();
    } catch (error: any) {
      console.error("Error creating problem:", error);
      message.error(error?.message || "Failed to create problem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px", background: "#fff", minHeight: "100vh" }}>
      <h2>Create New Problem</h2>
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item
          label="Problem Name"
          name="problemName"
          rules={[{ required: true, message: "Please enter the problem name!" }]}
        >
          <Input placeholder="Enter problem name" />
        </Form.Item>
        <Form.Item
          label="Problem Code"
          name="problemCode"
          rules={[{ required: true, message: "Please enter the problem code!" }]}
        >
          <Input placeholder="Enter problem code" />
        </Form.Item>
        <Form.Item
          label="Difficulty"
          name="difficulty"
          rules={[{ required: true, message: "Please select a difficulty!" }]}
        >
          <Select placeholder="Select difficulty">
            <Select.Option value="easy">Easy</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="hard">Hard</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Maximum Points"
          name="maxPoint"
          rules={[{ required: true, message: "Please enter the maximum points!" }]}
        >
          <InputNumber min={0} placeholder="Enter max points" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Contest ID"
          name="contestId"
          rules={[{ required: true, message: "Please enter the contest ID!" }]}
        >
          <InputNumber min={0} placeholder="Enter contest ID" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Problem Statement"
          name="problemStatement"
          rules={[{ required: true, message: "Please enter the problem statement!" }]}
        >
          <TextArea rows={4} placeholder="Enter problem statement" />
        </Form.Item>
        <Form.Item
          label="Tags (comma-separated)"
          name="tags"
          rules={[{ required: true, message: "Please enter at least one tag!" }]}
        >
          <Input placeholder="e.g., math, algorithms" />
        </Form.Item>
        <Form.Item
          label="Inputs (each input on a new line)"
          name="inputs"
          rules={[{ required: true, message: "Please provide the inputs!" }]}
        >
          <TextArea rows={4} placeholder="Enter inputs, each on a new line" />
        </Form.Item>
        <Form.Item
          label="Outputs (each output on a new line)"
          name="outputs"
          rules={[{ required: true, message: "Please provide the outputs!" }]}
        >
          <TextArea rows={4} placeholder="Enter outputs, each on a new line" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Problem
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateProblemPage;
