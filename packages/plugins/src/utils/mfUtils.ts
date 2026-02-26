type SimpleRemote = {
  entry: string;
  name: string;
  aliasName?: string;
  runtimeEntryPath?: object;
};

type RemoteEntries = {
  name: string;
  entries: object;
  keyResolver: string;
  aliasName?: string;
  runtimeEntryPath?: object;
};

type Remote = SimpleRemote | RemoteEntries;

function isSimpleRemote(r: any): r is SimpleRemote {
  return r.entry;
}

function isRemoteEntries(r: any): r is RemoteEntries {
  return r.entries && r.keyResolver;
}

export function toRemotesCodeString(remotes: Remote[]): string {
  const res: string[] = [];

  for (const r of remotes) {
    const aliasName = r.aliasName || r.name;
    const remoteName = r.name;

    if (isSimpleRemote(r)) {
      res.push(`${aliasName}: {
  aliasName: "${aliasName}",
  remoteName: "${remoteName}",
  entry: ${
    r.runtimeEntryPath ? `window["mf_${r.name}EntryPath"]` : `"${r.entry}"`
  }
}`);
    }

    if (isRemoteEntries(r)) {
      res.push(`${aliasName}: {
  aliasName: "${aliasName}",
  remoteName: "${remoteName}",
  entry: ${
    r.runtimeEntryPath
      ? `window["mf_${r.name}EntryPath"]`
      : `(${JSON.stringify(r.entries)})[${r.keyResolver}]`
  }
}`);
    }
  }
  return res.join(',\n');
}
