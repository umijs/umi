<template>
  <div class="layout">
    <header>
      <div class="title">BoulerplateVue</div>
      <nav class="nav">
        <router-link to="/">Home</router-link>
        <router-link to="/docs">Docs</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/list">List</router-link>
        <router-link to="/users">Users</router-link>
        <router-link to="/jsx-demo">Jsx Demo</router-link>
      </nav>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>
<style lang="less" scoped>
.layout {
  padding: 0 20px;
}

header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #d1d1d1;
  padding: 12px;
}

.title {
  width: 300px;
  font-size: 23px;
  font-weight: bold;
}

nav {
  flex: 1;

  a {
    font-size: 20px;
    font-weight: 500;
    margin-right: 16px;
  }
}

main {
  padding-top: 10px;
}
</style>
