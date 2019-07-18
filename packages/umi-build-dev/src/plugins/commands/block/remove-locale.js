import uni18n from 'umi-uni18n/src';

export default (cwd, locale) => {
  uni18n({
    cwd,
    locale,
    write: true,
  });
};
