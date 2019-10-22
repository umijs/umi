export default function({ blockService, success }) {
  success({
    data: blockService.getFolderTreeData(),
    success: true,
  });
}
