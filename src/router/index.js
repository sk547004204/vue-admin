import Vue from 'vue'
import Router from 'vue-router'
import routes from '@/router/routes';
import store from '@/store';

Vue.use(Router)


const router = new Router({
  mode: 'history',
  routes: routes
});


// 页面刷新时，重新赋值token
if (window.localStorage.getItem('token')) {
  store.dispatch('reload');
} else {
  store.dispatch('logout');
}

const withOutRoute = [
  '/admin/404',
  '/'
];

// 前置拦截
router.beforeEach((to, from, next) => {
  // 强制重定向
  if (to.path == '/admin') {
      next({
        path: '/admin/dashboard'
      })
      return;
  }
  // console.log(from.meta, to.meta,  withOutRoute.indexOf(to.path));
  // 路由权限拦截
  if (store.state.username !== 'admin' && withOutRoute.indexOf(to.path) < 0)
  {
    if (to.meta.power != undefined)
    {
        if (store.state.permissions.indexOf(to.meta.power) < 0)
        {
            // 重定向404
            next({
              path: '/admin/404'
            })
            return;
        }
    }
  }



  // 根据路由，设置显示的Breadcurm
  let breadcurmbs = [];
  for(let index in to.matched)
  {
    breadcurmbs.push({
      name: to.matched[index].meta.aliasName,
      href: to.matched[index].path
    });
  }
  store.dispatch('changeBreadcurmbs', breadcurmbs);




  // 登录拦截
  if (to.matched.some(r => r.meta.auth)) {
    if (store.state.accessToken) {
      next();
    } else {
      // 记录最后一个地址
      store.dispatch('setHistory', to.fullPath);
      next({
        path: '/'
      })
      return;
    }
  }


  // // store.commit('updateLoadingStatus', {isLoading: true})
  // // store.commit('updateDisplayBar', {displayBar: to.meta.bar})
  // if (to.matched.some(r => r.meta.auth)) {
  //     if (store.state.token) {
  //       next();
  //     } else {
  //       /* 记录登录前的地址 */
  //       store.commit(types.EXIT, to.fullPath);
  //       next({
  //           path: '/login',
  //           query: {
  //             redirect: to.fullPath
  //           }
  //       })
  //     }
  // }
  next()
})

router.afterEach(function (to) {
  // store.commit('updateLoadingStatus', {isLoading: false})
})

export default router
