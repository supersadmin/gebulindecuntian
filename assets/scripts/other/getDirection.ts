import {PhysicsSystem2D,find,Node} from 'cc'


const m=new Map<string,Node>()
/**封装find方法,对结果进行缓存 */
export function myFind(t:string){
  if(m.has(t)&&m.get(t).isValid){
    return m.get(t)
  }
  const n=find(t)
  m.set(t,n)
  n?.once(Node.EventType.NODE_DESTROYED,()=>m.delete(t))
  return n
}

/**角色动画列表序号 */
export const directionIndex={
  down:['01','02','03','02'],
  left:['04','05','06','05'],
  right:['07','08','09','08'],
  top:['10','11','12','11']
}

/**计算角色朝向 */
export const computedDirection=(x:number,y:number)=>{
  if(x===0&&y===0){
    return null
  }else if(Math.abs(x)>Math.abs(y)){
    return x>0?'right':'left'
  }else{
    return y>0?'top':'down'
  }
}

/**获取名称前缀 */
export const getSpriteName = (t: string) => t.split('_')[0]

/**为函数添加节流功能并且添加一个参数dt,
 * dt为函数连续两次执行的间隔
 * @param fn 要封装的函数
 * @param time 时间毫秒
 */
export function throttleBox(fn:Function,time:number){
  
  let end=true
  let dt=0

  return (...arg)=>{
    if(!end){
      return
    }
    if(dt===0){
      dt=Date.now()
    }
    fn(...arg,Date.now()-dt)
    end=false
    dt=Date.now()
    setTimeout(()=>end=true,time)
  }

}

/**地图大小 */
function mapSizeComputed() {
  const width = 4000
  const height = 2000
  return {
    width,
    height,
    radiusX: width / 2,
    radiusY: height / 2
  }
}

/**地图大小 */
export const mapSize = mapSizeComputed()


type PhysicsGroup = Record<'default'|'guaiwuzidan'|'juese'|'guaiwu'|'zanai'|'juesezidan', number>;
/**物理碰撞分组 */
export const physicsGroup:PhysicsGroup={
  default:PhysicsSystem2D.PhysicsGroup['DEFAULT'],
  guaiwuzidan:PhysicsSystem2D.PhysicsGroup['guaiwuzidan'],
  juese:PhysicsSystem2D.PhysicsGroup['juese'],
  guaiwu:PhysicsSystem2D.PhysicsGroup['guaiwu'],
  zanai:PhysicsSystem2D.PhysicsGroup['zanai'],
  juesezidan:PhysicsSystem2D.PhysicsGroup['juesezidan']
}