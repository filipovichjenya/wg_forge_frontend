import Model from './model';
import View from './view';
import Controller from './controller';
import PubSub from './pubsub';


export default (function () {
   new Controller(new Model(new PubSub), new View(document.getElementById('app')));   
}());