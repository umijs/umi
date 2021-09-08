interface IOpts {
  targets: Record<string, any>;
}

export function getBrowsersList({ targets }: IOpts) {
  return (
    targets.browsers ||
    Object.keys(targets).map((key) => {
      return `${key} >= ${targets[key] === true ? '0' : targets[key]}`;
    })
  );
}
