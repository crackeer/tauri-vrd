import { writeTextFile, BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import dayjs from 'dayjs';

var getJSON = async (key) => {
    try {
        let value =  await readTextFile(key, { dir: BaseDirectory.Cache });
        return JSON.parse(value)
    } catch(e) {
        return ''
    }
}

var setJSON = async (key, value) => {
    try {
        return await writeTextFile(key, JSON.stringify(value), { dir: BaseDirectory.Cache });
    } catch(e) {
        return false;
    }
}

var getText = async (key) => {
    try {
        let value =  await readTextFile(key, { dir: BaseDirectory.Cache });
        return value
    } catch(e) {
        return ''
    }
}

var setText = async (key, value) => {
    try {
        return await writeTextFile(key, value, { dir: BaseDirectory.Cache });
    } catch(e) {
        return false;
    }
}


export default {
    getJSON,
    setJSON,
    setText,
    getText
}