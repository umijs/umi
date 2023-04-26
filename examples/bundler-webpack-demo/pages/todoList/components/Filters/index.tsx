import { Button } from 'antd';
import { Fragment } from 'react';
import styled from 'styled-components';
import { useSnapshot } from 'valtio';
import { Filter, FILTER_STR } from '../../interface';
import { setFilter, store } from '../../store';

const Filters = () => {
  const snap = useSnapshot(store);

  const FilterWrapper = styled.nav`
    display: flex;
    justify-content: space-between;
    height: 48px;
    align-items: center;
    background-color: #1677ff;
    margin-top: 30px;
    padding: 0 20px;
    color: #fff;
  `;

  const FilterBtn = styled(Button)`
    margin-right: 20px;
  `;
  return (
    <FilterWrapper>
      <div>任务列表</div>
      <div>
        {Object.entries(FILTER_STR).map(([key, value]) => (
          <Fragment key={key}>
            <FilterBtn
              onClick={() => setFilter(key as Filter)}
              style={{
                backgroundColor: snap.filter === key ? 'lightgreen' : '#fff',
                color: snap.filter === key ? '#fff' : '#000',
              }}
            >
              {value.label}
            </FilterBtn>
          </Fragment>
        ))}
      </div>
    </FilterWrapper>
  );
};
export default Filters;
