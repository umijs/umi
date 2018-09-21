
export function walk(path){
	var dirList = fs.readdirSync(path);
	let fileList=[];
	dirList.forEach(function(item){
		if(fs.statSync(path + '/' + item).isFile()){
			fileList.push(path + '/' + item);
		}
	});
	
	dirList.forEach(function(item){
		if(fs.statSync(path + '/' + item).isDirectory()){
			fileList.concat(walk(path + '/' + item));
		}
	});
	return fileList;
}