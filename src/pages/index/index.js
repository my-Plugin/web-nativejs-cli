// 导入scss
import "./index.scss";

import $ from 'jquery';

$("#name").text('text of jquery render');

// 异步模块加载
// 异步加载的模块代码，将会通过script标签，动态的插入header标签内
setTimeout(() => {
  import('./print').then(module => {
    module.default('hello, world')
  })
}, 2000);