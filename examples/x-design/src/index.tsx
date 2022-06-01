import './index.less';

interface IButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  primary?: boolean;
}

const Button: React.FC<IButtonProps> = ({ primary, children }) => {
  return (
    <div className={`x-button ${primary ? 'is-primary' : ''}`}>
      x {children}
    </div>
  );
};

export { Button };
