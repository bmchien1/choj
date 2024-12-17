import {useState} from "react";
import {Typography} from "antd";
import {FaCheck, FaCopy} from "react-icons/fa6";

interface CopyableBoxProps {
	text: string;
	displayText: string;
}

const CopyableBox = ({ text, displayText }: CopyableBoxProps) => {
	const [isCopied, setIsCopied] = useState(false);
	const copy = async () => {
		await navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 1000);
	};
	return (
		<div
			style={{
				backgroundColor: '#272822',
				padding: 10,
				display: 'flex',
				justifyContent: 'space-between',
			}}>
			<Typography.Text
				style={{
					width: '90%',
					whiteSpace: 'pre-wrap',
					wordWrap: 'break-word',
					wordBreak: 'break-word',
					color: 'white',
				}}
			>
				{displayText}
			</Typography.Text>
			<div
				className="cursor-pointer"
				onClick={copy}
			>
				{
					isCopied ?
						(
							<FaCheck
								size={25}
								color={'white'}
								className={'border-1 rounded-md border-white p-1'}
							/>
						) : (
							<FaCopy
								size={25}
								color={'white'}
								className={'border-1 rounded-md border-white p-1'}
							/>
						)
				}
			</div>
		</div>
	);
}

export default CopyableBox;