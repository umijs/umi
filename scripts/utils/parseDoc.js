module.exports = function (docStr) {
  docStr = docStr.trim();
  const hasYamlConfig = docStr.startsWith('---');
  const docArr = docStr.split('\n');

  let title = null;
  let titleIndex = null;
  let yamlEndIndex = null;

  let i = hasYamlConfig ? 1 : 0;
  while (i < docArr.length) {
    const line = docArr[i];

    // yaml end
    if (line.startsWith('---')) {
      yamlEndIndex = i;
    }

    // title
    if (line.startsWith('# ') && titleIndex === null) {
      title = line.replace('# ', '');
      titleIndex = i;
    }

    i += 1;
  }

  if (titleIndex === null && yamlEndIndex !== null) {
    titleIndex = yamlEndIndex;
  }

  return {
    hasYamlConfig,
    title,
    yamlConfig: hasYamlConfig ? docArr.slice(1, yamlEndIndex) : [],
    body: docArr.slice(titleIndex === null ? titleIndex : titleIndex + 1),
  };
};
