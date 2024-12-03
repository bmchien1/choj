import AceEditor from "react-ace";
import {AceEditorProps} from "react-ace/types";

import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";

import "ace-builds/src-noconflict/theme-monokai";

interface CodeEditorProps extends AceEditorProps {
	code: string;
	setCode: (code: string) => void;
	mode: string;
}

export default function CodeEditor({code, setCode, mode, ...props}: CodeEditorProps) {
	return (
		<AceEditor
			mode={mode}
			theme="monokai"
			onChange={setCode}
			value={code}
			fontSize={14}
			showPrintMargin={true}
			showGutter={true}
			highlightActiveLine={true}
			setShowPrintMargin={true}
			setShowGutter={true}
			name={'UNIQUE_ID_OF_DIV'}
			height={'500px'}
			editorProps={{$blockScrolling: false}}
			// @ts-ignore
			setOptions={{
				enableBasicAutocompletion: true,
				enableLiveAutocompletion: true,
				enableSnippets: true,
				showLineNumbers: true,
			}}
			style={{width: '100%'}}
			{...props}
		/>
	)
}