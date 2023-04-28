import { Button } from 'antd';
import styled from 'styled-components';
import { useSnapshot } from 'valtio';
import { Filter, FILTER_INFO_MAP } from '../../interface';
import { setFilter, store } from '../../store';
import { FlexCenter } from '../../styles/layout';

const FilterWrapper = styled(FlexCenter)`
  background-color: #1677ff;
  margin-top: 30px;
  color: #fff;
`;

const FilterBtn = styled(Button)<{ isSelect: boolean }>`
  & + & {
    margin-left: 20px;
  }
  background: ${(props) => (props.isSelect ? 'lightgreen' : '#fff')};
  color: ${(props) => (props.isSelect ? '#fff' : '#000')};
`;

const Filters = () => {
  const snap = useSnapshot(store);

  return (
    <FilterWrapper>
      <div>任务列表</div>
      <div>
        {Object.entries(FILTER_INFO_MAP).map(([key, value]) => (
          <FilterBtn
            key={key}
            onClick={() => setFilter(key as Filter)}
            isSelect={snap.filter === key}
          >
            {value.label}
          </FilterBtn>
        ))}
      </div>
    </FilterWrapper>
  );
};
export default Filters;
