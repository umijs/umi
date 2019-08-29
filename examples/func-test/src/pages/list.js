import React from 'react';
import Link from 'umi/link';

export default () => {
  const list = Array(200)
    .fill('')
    .map((item, index) => {
      return (
        <Link to={`/test`} key={index}>
          <div>Item - {index}</div>
        </Link>
      );
    });
  const desc = (
    <div>
      <p>
        This page of route is using <code>LiveRoute</code> with <code>livePath</code>.
      </p>
      <p>
        In this page, the list page will not be unmounted on item detail page and will be unmounted
        when enter into other pages such as home page.
      </p>
      <p>
        The count number above is a sign of component live state. It will be reset to 0 when the
        component of Route unmounted. You can scroll the page and it will be restored when backing
        from item detail page.
      </p>
      <p>Feel free to try it.</p>
    </div>
  );
  return (
    <div>
      {desc}
      {list}
    </div>
  );
};
