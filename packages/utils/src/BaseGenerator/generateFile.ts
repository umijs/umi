import prompts from '../../compiled/prompts';
import BaseGenerator from './BaseGenerator';

const generateFile = async ({
  path,
  target,
  data,
  questions,
}: {
  path: string;
  target: string;
  data?: any;
  questions?: prompts.PromptObject[];
}) => {
  const generator = new BaseGenerator({
    path,
    target,
    data,
    questions,
  });

  await generator.run();
};

export default generateFile;
