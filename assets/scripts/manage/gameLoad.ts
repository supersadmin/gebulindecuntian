import { _decorator, Component, Node,Prefab,resources,director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameLoad')
export class gameLoad extends Component {


    start() {
        
        /**预加载资源列表 */
        // const loadList=new Map()
        // loadList.set('prefab/zizunv',Prefab)
        // loadList.set('prefab/sujin',Prefab)
        // loadList.set('prefab/bloodBox',Prefab)
        // loadList.set('prefab/direction',Prefab)
        resources.loadDir('/',(err,data)=>{
            if(err){
                console.log('资源加载失败',err)
            }else{
                console.log(data)
                director.loadScene('game-1')
            }
        })
    }

    update(deltaTime: number) {
        
    }
}


