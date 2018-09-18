export default function(api, option) {
  api.onOptionChange(newOption => {
    option = newOption;
    api.rebuildHTML();
    api.refreshBrowser();
  });

  api.addHTMLHeadScript(() => {
    return option;
  });
}
