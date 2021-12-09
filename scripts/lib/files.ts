import fs from 'fs';

/**
 * Read a json file from local storage by providing a path, file name and file extension.
 * 
 * @param filePath 
 * @returns 
 */
export const readJSONFile = async (filePath: string): Promise<Buffer> => {
	try {
		const buffer = await fs.promises.readFile(filePath, 'utf8');
		return JSON.parse(buffer);
	} catch (e: any) {
		throw new Error(`Error reading ${filePath}: ${e}`);
	}
};

/**
 * Write a js object to local storage by providing a path, file name and file extension.
 * 
 * @param fileName 
 * @param data 
 */
export const writeJSONToFile = async (
	fileName: string,
	data: {}
): Promise<void> => {
	try {
		await fs.promises.writeFile(fileName, JSON.stringify(data, null, 4));
	} catch (e: any) {
		console.error(`Error writing ${fileName}: ${e}`);
	}
};