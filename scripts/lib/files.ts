import fs from 'fs';

export const readJSONFile = async (filePath: string): Promise<Buffer> => {
	try {
		const buffer = await fs.promises.readFile(filePath, 'utf8');
		return JSON.parse(buffer);
	} catch (e) {
		throw new Error(`Error reading ${filePath}: ${e}`);
	}
};

export const writeJSONToFile = async (
	fileName: string,
	data: {}
): Promise<void> => {
	try {
		await fs.promises.writeFile(fileName, JSON.stringify(data, null, 4));
	} catch (e) {
		console.error(`Error writing ${fileName}: ${e}`);
	}
};