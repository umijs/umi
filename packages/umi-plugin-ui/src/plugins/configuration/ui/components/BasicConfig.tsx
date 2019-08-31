import React, { useEffect, useState, useContext, useRef } from 'react';
import cls from 'classnames';
import { Search as SearchIcon, CloseCircleFilled } from '@ant-design/icons';
import Fuse from 'fuse.js';
import { Button, Form, Input, Spin, message, Popconfirm } from 'antd';
import { IUiApi } from 'umi-types';
import isEmpty from 'lodash/isEmpty';
import serialize from 'serialize-javascript';
import Context from '../Context';
import useToggle from './common/useToggle';
import configMapping from './ConfigItem';
import Toc from './common/Toc';
import { getToc } from './ConfigItem/utils';
import { getDiffItems, arrayToObject, getChangedDiff } from './utils';
import styles from './BasicConfig.module.less';

interface IBasicConfigProps {
  api: IUiApi;
}

const BasicConfig: React.FC<IBasicConfigProps> = props => {
  const containerRef = useRef();
  const [data, setData] = useState<object[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState<string>('');
  const searchInputRef = useRef();
  const [showSearch, toggleSearch] = useToggle(false);
  // const [submitLoading, setSubmitLoading] = useState(false);
  // const [disabled, setDisabled] = useState(true);
  const { api, theme, debug: _log } = useContext(Context);
  const { _, intl } = api;

  const handleSearch = (vv = '') => {
    setSearch(vv);
  };
  const handleSearchDebounce = _.debounce(handleSearch, 150);
  const resetSearch = () => {
    toggleSearch(false);
    setSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.handleReset();
    }
  };
  const handleSearchShow = () => {
    toggleSearch();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useEffect(() => {
    setLoading(true);
    (async () => {
      await updateData();
    })();
    setLoading(false);
    return () => {
      handleSearchDebounce.cancel();
    };
  }, []);

  async function updateData() {
    const { data } = await api.callRemote({
      type: 'org.umi.config.list',
    });
    setData(data);
  }

  function formatValue(value) {
    if (typeof value === 'object') {
      return serialize(value);
    }
    return value.toString();
  }

  const fuse = React.useMemo(
    () =>
      new Fuse(data || [], {
        caseSensitive: true,
        shouldSort: true,
        threshold: 0.6,
        keys: ['name', 'title', 'description', 'group'],
      }),
    [data],
  );

  const searchData = React.useMemo(
    () => {
      _log('searchsearchsearch', search);
      const result = fuse.search(search);
      _log('resultresultresult', result);
      if (result.length > 0) {
        return result;
      }
      return data || [];
    },
    [search, data],
  );

  _log('searchData', searchData);

  const groupedData = {};
  _log('data', data);
  searchData.forEach(item => {
    const { group } = item;
    if (!groupedData[group]) {
      groupedData[group] = [];
    }
    groupedData[group].push(item);
  });

  const initialValues = arrayToObject(searchData);
  const [allValues, setAllValues] = useState();

  if (loading) {
    return <Spin />;
  }

  const getChangedValue = React.useCallback(
    vv => {
      return getDiffItems(vv, arrayToObject(data, false));
    },
    [data],
  );

  const getResetChangedValue = React.useCallback(
    vv => {
      return getChangedDiff(arrayToObject(data), vv);
    },
    [data],
  );

  const handleFinish = async values => {
    _log('handleFinish values', values);
    const changedValues = getChangedValue(values);
    _log('before changedValues', changedValues);
    if (!Object.keys(changedValues).length) {
      // no edit config
      return false;
    }
    const loadingMsg = message.loading('正在保存配置', 0);

    Object.keys(changedValues).forEach(name => {
      changedValues[name] = formatValue(changedValues[name]);
    });

    _log('after changedValues', changedValues);

    try {
      await api.callRemote({
        type: 'org.umi.config.edit',
        payload: {
          key: changedValues,
          value: '',
        },
      });
      await updateData();
      message.success('配置修改成功');
    } catch (e) {
      loadingMsg();
      message.error(e.message);
      console.error(e.message, e);
      if (Array.isArray(e.errors) && e.errors.length > 0) {
        const [firstField] = e.errors;
        form.setFields(e.errors);
        form.scrollToField(firstField.name);
      }
    } finally {
      loadingMsg();
      // setSubmitLoading(false);
    }
  };

  const handleFinishFailed = ({ errorFields }) => {
    const [firstErrorField] = errorFields;
    const [firstErrorFieldName] = firstErrorField.name;
    form.scrollToField(firstErrorFieldName);
  };

  const handleReset = () => {
    form.resetFields();
    setAllValues({});
  };

  const handleSubmit = () => {
    form.submit();
  };

  const themeCls = cls(styles.basicConfig, styles[`basicConfig-${theme}`]);

  const tocAnchors = getToc(groupedData, isEmpty(allValues) ? initialValues : allValues);
  const searchIconCls = cls(styles['basicConfig-header-searchIcon'], {
    [styles['basicConfig-header-searchIcon-hide']]: !!showSearch,
  });
  const inputCls = cls(styles['basicConfig-header-input'], {
    [styles['basicConfig-header-input-active']]: !!showSearch,
  });

  const changedValueArr = Object.keys(getResetChangedValue(allValues));

  const ResetTitle = (
    <div className={styles.resetTitle}>
      <p>{intl({ id: 'org.umi.ui.configuration.reset.tooltip' })}</p>
      <span>
        {changedValueArr.length > 0
          ? intl(
              { id: 'org.umi.ui.configuration.reset.tooltip.desc' },
              {
                value: changedValueArr.join('、'),
              },
            )
          : intl({ id: 'org.umi.ui.configuration.reset.tooltip.desc.empty' })}
      </span>
    </div>
  );

  _log('searchData', searchData);
  _log('datadata', data);

  return (
    <>
      <div className={themeCls} ref={containerRef}>
        <div className={styles.form}>
          <div className={styles['basicConfig-header']}>
            <h2>{intl({ id: 'org.umi.ui.configuration.project.config.title' })}</h2>
            <span className={searchIconCls}>
              <SearchIcon onClick={handleSearchShow} />
            </span>
            <Input
              prefix={<SearchIcon />}
              ref={searchInputRef}
              suffix={search && <CloseCircleFilled onClick={resetSearch} />}
              placeholder={intl({ id: 'org.umi.ui.configuration.search.placeholder' })}
              className={inputCls}
              onChange={e => handleSearchDebounce(e.target.value)}
            />
          </div>
          {!data ? (
            <Spin />
          ) : (
            searchData.length > 0 && (
              <div>
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handleFinish}
                  onFinishFailed={handleFinishFailed}
                  initialValues={initialValues}
                  onValuesChange={(changedValues, allValues) => {
                    setAllValues(allValues);
                  }}
                >
                  {Object.keys(groupedData).map(group => {
                    return (
                      <div className={styles.group} key={group}>
                        <h2 id={group}>{group}</h2>
                        {groupedData[group].map(item => {
                          const ConfigItem = configMapping[item.type] || configMapping.any;
                          return <ConfigItem key={item.name} {...item} form={form} />;
                        })}
                      </div>
                    );
                  })}
                  <Form.Item shouldUpdate>
                    {({ getFieldsValue }) => {
                      // TODO: remove before publish
                      _log('Form values', JSON.stringify(getFieldsValue(), null, 2));
                    }}
                  </Form.Item>
                </Form>
              </div>
            )
          )}
        </div>
        <Toc
          className={styles.toc}
          anchors={tocAnchors}
          getContainer={() => containerRef && containerRef.current}
        />
      </div>
      <div className={styles['basicConfig-submit']}>
        <Popconfirm
          title={ResetTitle}
          placement="topRight"
          onConfirm={handleReset}
          onCancel={() => {}}
          okText={intl({ id: 'org.umi.ui.configuration.okText' })}
          cancelText={intl({ id: 'org.umi.ui.configuration.cancelText' })}
        >
          <Button>{intl({ id: 'org.umi.ui.configuration.reset' })}</Button>
        </Popconfirm>
        <Button onClick={handleSubmit} style={{ marginRight: 24 }} type="primary">
          {intl({ id: 'org.umi.ui.configuration.save' })}
        </Button>
      </div>
    </>
  );
};

export default BasicConfig;
