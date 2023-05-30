import { _decorator, Component, Node,Prefab,resources,director, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameLoad')
export class gameLoad extends Component {

    @property({type:Label})
    loadLabel:Label=null

    @property({type:Node})
    button:Node=null

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
                director.loadScene('game-load')
            }else{
                this.loadLabel.string='资源已加载完毕'   
                this.button.active=true
                director.preloadScene('game-1')    
            }
        })

        this.button.on(Node.EventType.TOUCH_END,()=>director.loadScene('game-1'))


    }

    
}


