import {Modal} from "antd"
import {CopyableBox} from "@/components";

interface SubmissionMessageModalProps {
	open: boolean;
	onClose: () => void;
	error?: string;
	message?: string;
}

const SubmissionMessageModal = (props: SubmissionMessageModalProps) => {
	return (
		<Modal
			title="Submission message"
			open={props.open}
			onCancel={props.onClose}
			footer={null}
			width={1000}
		>
			<CopyableBox
				text={
					props?.error || props?.message || ''
				}
				displayText={
					props?.error || props?.message || ''
				}
			/>
		</Modal>
	)
}

export default SubmissionMessageModal;