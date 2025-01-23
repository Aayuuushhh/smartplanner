import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
//@ts-ignore
import Delimiter from '@editorjs/delimiter';

const editor = new EditorJS({
  holder: 'editorjs', // The ID of the container element where the editor will be mounted
  tools: {
    header: Header,
    list: List,
    delimiter: Delimiter,
    // Add other tools you want to use
  },
});

export default editor;
