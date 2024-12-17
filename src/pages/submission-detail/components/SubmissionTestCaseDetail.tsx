import {Modal, Typography} from "antd"
import {CopyableBox} from "@/components";

interface SubmissionTestCaseDetailModalProps {
	open: boolean;
	onClose: () => void;
	input?: string;
	expectedOutput?: string;
	userOutput?: string;
}

const SubmissionTestCaseDetailModal = (props: SubmissionTestCaseDetailModalProps) => {
	return (
		<Modal
			title="Submission testcase detail"
			open={props.open}
			onCancel={props.onClose}
			footer={null}
			width={1000}
		>
			<div className={'mb-3'}>
				<Typography.Text strong>Input:</Typography.Text>
				<CopyableBox
					text={props?.input || ''}
					displayText={props?.input || ''}
				/>
			</div>
			<div className={'mb-3'}>
				<Typography.Text strong>Expected output:</Typography.Text>
				<CopyableBox
					text={props?.expectedOutput || ''}
					displayText={props?.expectedOutput || ''}
				/>
			</div>
			<div>
				<Typography.Text strong>User output:</Typography.Text>
				<CopyableBox
					text={props?.userOutput || ''}
					displayText={props?.userOutput || ''}
				/>
			</div>
		</Modal>
	)
}

export default SubmissionTestCaseDetailModal;