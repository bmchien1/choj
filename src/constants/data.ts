export const JWT_LOCAL_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJtaW5obmd1eWVuQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NDQ3MTE0NCwiZXhwIjoxNzQ0NDc0NzQ0fQ.9pk4PAaqr-xZqbyQFUBHmpp6WyZI52iE1IcCfzETYLQ'

export const LIST_LANGUAGE = [
	{
		id: 50,
		name: "C (GCC 9.2.0)",
		code: `#include <stdio.h>\n\nint main() {\n\treturn 0;\n}`,
		mode: 'c',
		fileExtension: 'c',
	},
	{
		id: 54,
		name: "C++ (GCC 9.2.0)",
		code: `#include <bits/stdc++.h>\n\nint main() {\n\treturn 0;\n}`,
		mode: 'c_cpp',
		fileExtension: 'cpp',
	},
	{
		id: 62,
		name: "Java (OpenJDK 13.0.1)",
		code: `//JAVA\nimport java.util.*;\n\n@SuppressWarnings({"unchecked", "deprecation"})` +
			`\nclass Main {\n\tpublic static void main(String[] args) {\n\n\t}\n}` +
			`\n`,
		mode: 'java',
		fileExtension: 'java',
	},
	{
		id: 63,
		name: "JavaScript (Node.js 12.14.0)",
		code: `//JavaScript\n\nconsole.log('Hello, World!');`,
		mode: 'javascript',
		fileExtension: 'js',
	},
	{
		id: 71,
		name: "Python (3.8.1)",
		code: `#PYTHON`,
		mode: 'python',
		fileExtension: 'py',
	},
]