<template>
  <div class="navs">
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <router-link to="/docs">Docs</router-link>
      </li>
      <li>
        <a href="https://github.com/umijs/umi">Github</a>
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>
<style lang="less">
.navs {
  ul {
    padding: 0;
    list-style: none;
    display: flex;
  }
  li {
    margin-right: 1em;
  }
}
</style>
