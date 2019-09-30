import React, { useEffect, useState, useContext, useRef } from 'react';
import cls from 'classnames';
import { Search as SearchIcon, CloseCircleFilled } from '@ant-design/icons';
import Fuse from 'fuse.js';
import { IUi } from 'umi-types';
import { Button, Form, Input, Spin, message, Popconfirm } from 'antd';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import { formatMessage } from 'umi-plugin-react/locale';
import serialize from 'serialize-javascript';
import Context from '@/layouts/Context';
import { callRemote } from '@/socket';
import Field from '@/components/Field';
import useToggle from './common/useToggle';
import debug from '@/debug';
import Toc from './common/Toc';
import { getDiffItems, arrayToObject, getChangedDiff, getToc } from './utils';
import styles from './index.less';

const ConfigForm: React.FC<IUi.IConfigFormProps> = props => {
  const _log = debug.extend('ConfigForm');
  const { enableToc = true } = props;
  const containerRef = useRef();
  const [data, setData] = useState<object[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState<string>('');
  const searchInputRef = useRef();
  const [showSearch, toggleSearch] = useToggle(false);
  const { theme, locale, isMini } = useContext(Context);

  const handleSearch = (vv = '') => {
    setSearch(vv);
  };
  const handleSearchDebounce = debounce(handleSearch, 150);
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

  useEffect(
    () => {
      updateData();
      return () => {
        handleSearchDebounce.cancel();
      };
    },
    [props.title, props.list, props.edit, locale],
  );

  async function updateData() {
    setLoading(true);
    const { data } = await callRemote({
      type: props.list,
    });
    setLoading(false);
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
      new Fuse(
        data || [],
        props.fuseOpts || {
          caseSensitive: true,
          shouldSort: true,
          threshold: 0.6,
          keys: ['name', 'title', 'description', 'group'],
        },
      ),
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

  const getChangedValue = vv => {
    return getDiffItems(vv, arrayToObject(data, false), data);
  };

  const getResetChangedValue = React.useCallback(
    vv => {
      const dataObj = arrayToObject(data);
      return getChangedDiff(dataObj, vv);
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
    const loadingMsg = message.loading(
      formatMessage({ id: 'org.umi.ui.configuration.edit.loading' }),
      0,
    );

    Object.keys(changedValues).forEach(name => {
      changedValues[name] = formatValue(changedValues[name]);
    });

    _log('after changedValues: really submit', changedValues);

    try {
      await callRemote({
        type: props.edit,
        payload: {
          key: changedValues,
          value: '',
        },
      });
      await updateData();
      message.success(formatMessage({ id: 'org.umi.ui.configuration.edit.success' }));
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

  const themeCls = cls(styles.configForm, styles[`configForm-${theme}`]);

  const tocAnchors = getToc(groupedData, isEmpty(allValues) ? initialValues : allValues);
  const searchIconCls = cls(styles['configForm-header-searchIcon'], {
    [styles['configForm-header-searchIcon-hide']]: !!showSearch,
  });
  const inputCls = cls(styles['configForm-header-input'], {
    [styles['configForm-header-input-active']]: !!showSearch,
  });

  const changedValueArr = Object.keys(getResetChangedValue(allValues));

  const ResetTitle = (
    <div className={styles.resetTitle}>
      <p>{formatMessage({ id: 'org.umi.ui.configuration.reset.tooltip' })}</p>
      <span>
        {changedValueArr.length > 0
          ? formatMessage(
              { id: 'org.umi.ui.configuration.reset.tooltip.desc' },
              {
                value: changedValueArr.join('、'),
              },
            )
          : formatMessage({ id: 'org.umi.ui.configuration.reset.tooltip.desc.empty' })}
      </span>
    </div>
  );

  _log('searchData', searchData);
  _log('datadata', data);
  _log('initialValues', initialValues);

  return (
    <>
      <div className={themeCls} ref={containerRef}>
        <div className={styles.form}>
          <div className={styles['configForm-header']}>
            <h2>{formatMessage({ id: props.title })}</h2>
            <span className={searchIconCls}>
              <SearchIcon onClick={handleSearchShow} />
            </span>
            <Input
              prefix={<SearchIcon />}
              ref={searchInputRef}
              suffix={search && <CloseCircleFilled onClick={resetSearch} />}
              placeholder={formatMessage({ id: 'org.umi.ui.configuration.search.placeholder' })}
              className={inputCls}
              onChange={e => handleSearchDebounce(e.target.value)}
            />
          </div>
          {!data || loading ? (
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
                        {groupedData[group].map(
                          ({
                            default: defaultValue,
                            name,
                            title,
                            choices = [],
                            description,
                            link,
                            ...restItemProps
                          }) => {
                            const label = {
                              title,
                              description,
                              link,
                            };
                            return (
                              <Field
                                key={name}
                                label={label}
                                options={choices}
                                name={name}
                                defaultValue={defaultValue}
                                {...restItemProps}
                                form={form}
                              />
                            );
                          },
                        )}
                      </div>
                    );
                  })}
                </Form>
              </div>
            )
          )}
        </div>
        {enableToc && (
          <Toc
            className={styles.toc}
            anchors={tocAnchors}
            getContainer={() => containerRef && containerRef.current}
          />
        )}
      </div>
      <div className={styles['configForm-submit']}>
        <Popconfirm
          title={ResetTitle}
          placement="topRight"
          onConfirm={handleReset}
          onCancel={() => {}}
        >
          <Button size={isMini ? 'small' : 'default'}>
            {formatMessage({ id: 'org.umi.ui.configuration.reset' })}
          </Button>
        </Popconfirm>
        <Button
          size={isMini ? 'small' : 'default'}
          onClick={handleSubmit}
          style={{ marginRight: 24 }}
          type="primary"
        >
          {formatMessage({ id: 'org.umi.ui.configuration.save' })}
        </Button>
      </div>
    </>
  );
};

export default ConfigForm;
