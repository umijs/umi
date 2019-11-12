export default function({ success, resources }) {
  success({
    data: resources,
    success: true,
  });
}
