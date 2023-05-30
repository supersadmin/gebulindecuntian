import { _decorator, BoxCollider2D, Component, Contact2DType, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Obstacle')
export class Obstacle extends Component {
    /**与障碍接触的物体列表 */
    contactList=new Set<BoxCollider2D>()

    /**自己身上的碰撞机 */
    boxCollider:BoxCollider2D=null

    start() {

        this.boxCollider=this.getComponent(BoxCollider2D)
        this.boxCollider.on(Contact2DType.BEGIN_CONTACT,(_,colloder2:BoxCollider2D)=>{
            this.contactList.add(colloder2)
        })

        this.boxCollider.on(Contact2DType.END_CONTACT,(_,collider2:BoxCollider2D)=>{
            this.contactList.delete(collider2)
        })

    }

    update() {
        this.contactList.forEach(item=>{
            if(!item.isValid){
                this.contactList.delete(item)
                return
            }
            const [n1,n2]=[this.node,item.node]
            const p=new Vec3(n2.worldPosition.x-n1.worldPosition.x,n2.worldPosition.y-n1.worldPosition.y)
            const p2=[this.boxCollider.size.width/2+item.size.width/2,this.boxCollider.size.height/2+item.size.height/2]
            const s=[p2[0]-Math.abs(p.x),p2[1]-Math.abs(p.y)]
            if(Math.abs(s[0])<Math.abs(s[1])){
                s[0]=n1.worldPosition.x-n2.worldPosition.x>0?s[0]:-1*s[0]
                n2.setWorldPosition(new Vec3(n2.worldPosition.x-s[0],n2.worldPosition.y))
            }else{
                s[1]=n1.worldPosition.y-n2.worldPosition.y>0?s[1]:-1*s[1]
                n2.setWorldPosition(new Vec3(n2.worldPosition.x,n2.worldPosition.y-s[1]))
            }
        })
    }
}


