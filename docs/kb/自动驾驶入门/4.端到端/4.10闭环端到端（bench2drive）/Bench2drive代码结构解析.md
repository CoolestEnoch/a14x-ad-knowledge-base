# Bench2drive 代码结构解析

##### （1）开环训练代码结构：(以VAD为例子)
```plain
Bench2Drive
--|Bench2DriveZoo # 所有训练要使用的代码都在这里
----|adzoo
------|vad #类似mmdet3d中的tools文件夹，train.py 可视化代码在该文件夹下
----|analysis # 模型可视化的动图存放地址
----|ckpts # 模型训练所需要的img backbone存放地址
----|data # 训练数据地址
----|mmcv # 类似 mmdet3d 文件夹，所有的关键代码均在此目录下
------|core
------|dataset
------|layers
------|detectors
------|models
------|modeling
------|losses
```

###### （1.1）训练 --- prepare_data
所在目录 Bench2Drive/Bench2DriveZoo/mmcv/datasets/B2D_vad_dataset.py

相关数据接口  157 行

```plain
info['folder'] # 当前sample数据所在文件路径
info['frame_idx'] # 当前数据所属的frame标号
info['ego_yaw'] # 自车辆的偏航角
info['ego_translation'] # 当前车的坐标位置？
info['sensors'] # 当前数据以及相关的坐标转换矩阵
info['gt_ids'] # 当前数据的检测框唯一标识符号
info['gt_boxes'] # 当前数据的检测框标注
info['gt_names'] # 当前数据的检测框类别名字
info['ego_vel'] # 自我车辆的速度
info['ego_accel'] # 自我车辆的加速度
info['ego_rotation_rate'] # 自车的偏向角度
info['steer'] #导航命令
info['ego_size'] # 自车的anchors框
input_dict['ego_his_trajs'] # 自车历史轨迹 shape = [2,2]
input_dict['ego_fut_trajs'] # 自车未来轨迹 shape = [6,2]
input_dict['ego_fut_masks'] # 自车未来轨迹 shape = [1,6],用于处理轨迹的末尾
input_dict['ego_fut_cmd'] # 自车未来的驾驶命令 shape = [1,6]
```

###### （1.2）训练 --- plan 模块
代码位置 Bench2DriveZoo/mmcv/models/detectors/VAD.py，重点分析plan部分的模型输入以及输出

```plain
ego_his_feats = self.ego_his_encoder(ego_his_trajs)
# 编码自车历史轨迹
ego_agent_query = self.ego_agent_decoder(
   query=ego_query.permute(1, 0, 2),
   key=agent_query.permute(1, 0, 2),
   value=agent_query.permute(1, 0, 2),
   query_pos=ego_pos_emb.permute(1, 0, 2),
   key_pos=agent_pos_emb.permute(1, 0, 2),
   key_padding_mask=agent_mask)
# 自车轨迹为Q, Key和value为他车轨迹
ego_map_query = self.ego_map_decoder(
   query=ego_agent_query,
   key=map_query.permute(1, 0, 2),
   value=map_query.permute(1, 0, 2),
   query_pos=ego_pos_emb.permute(1, 0, 2),
   key_pos=map_pos_emb.permute(1, 0, 2),
   key_padding_mask=map_mask)
#  自车轨迹为Q，Key 和 value为 地图元素为查询
ego_feats = torch.cat(
   [ego_his_feats,
    ego_map_query.permute(1, 0, 2),
    ego_lcf_feat.squeeze(1)[..., self.ego_lcf_feat_idx]],
    dim=-1)
#   自车查询 拼接自车状态特征以及前方两个和历史信息以及地图元素的融合信息
outputs_ego_trajs = self.ego_fut_decoder(ego_feats)
outputs_ego_trajs = outputs_ego_trajs.reshape(
       outputs_ego_trajs.shape[0], 
       self.ego_fut_mode, 
       self.fut_ts, 
       2)
#     输出和开环自动驾驶没有区别，均为驾驶的航点 shape = [6,2]
```

###### （1.3）训练 --- loss 设置 plan模块 （其他模块开环闭环没有差异）
```plain
ego_fut_gt = ego_fut_gt.unsqueeze(1).repeat(1, self.ego_fut_mode, 1, 1)
loss_plan_l1_weight = ego_fut_cmd[..., None, None] * ego_fut_masks[:, None, :, None]
loss_plan_l1_weight = loss_plan_l1_weight.repeat(1, 1, 1, 2)

loss_plan_l1 = self.loss_plan_reg(
    ego_fut_preds,
    ego_fut_gt,
    loss_plan_l1_weight
    ) # 常规航路点回归位移偏差loss
loss_plan_bound = self.loss_plan_bound(
    ego_fut_preds[ego_fut_cmd==1],
    lane_preds,
    lane_score_preds,
    weight=ego_fut_masks
    ) # 路径和路沿碰撞的loss
loss_plan_col = self.loss_plan_col(
    ego_fut_preds[ego_fut_cmd==1],
    agent_preds,
    agent_fut_preds,
    agent_score_preds,
    agent_fut_cls_preds,
    weight=ego_fut_masks[:, :, None].repeat(1, 1, 2)
    ) # 路径和其他车辆碰撞的loss
```

综上，目前Bench2Drive的训练过程和传统开环的训练没有任何差别

##### （2）闭环测试代码结构：（以VAD为例子）
重点是 team_code中的代码

```plain
Bench2Drive
--|Bench2DriveZoo # 所有训练要使用的代码都在这里
----|team_code # 用于将航点转换为控制信号的最为关键的代码
```

###### （2.1）闭环测试代码解析
```plain
def run_step(self, input_data, timestamp):
    tick_data = self.tick(input_data)
```

input_data 包含的关键项:

```plain
'IMU' 测量物体三轴姿态角 和加速度 [1, 7], 
'GPS' 是一个[1,3]的三维坐标, 
'CAM_FRONT' shape = (900, 1600, 4), 
'CAM_FRONT_LEFT', 
'CAM_FRONT_RIGHT', 
'CAM_BACK', 
'CAM_BACK_LEFT', 
'CAM_BACK_RIGHT', 
'bev' shape = (512,512,4) 俯视Bev 图片, 
'SPEED' # 自车的速度
```

self.tick会进一步提取信息，tick_data所包含的关键项:

```plain
'imgs' # 6个相机的图片, 
'gps' # gps 是一个shape = [2,2] [-0.03513202,  0.00533875], 
'pos' # pos 是一个shape = [2,2]的位置, [1.99663423e+00, 3.91087894e+03], 
'speed' # 自车速度, 
'compass' # 4.875384330749512 用 raw theta 去计算 ego theta, 
'bev' # 俯视图, 
'acceleration', 
'angular_velocity' # 角速度, 
'command_near' # 命令 LANEFOLLOW, 
'command_near_xy' # [ -50.99938965, 3910.89770508]
```

随后根据 tick data去计算 自车的特征

```plain
can_bus = np.zeros(18)
can_bus[0] = tick_data['pos'][0]
can_bus[1] = -tick_data['pos'][1]
can_bus[3:7] = rotation
can_bus[7] = tick_data['speed']
can_bus[10:13] = tick_data['acceleration']
can_bus[11] *= -1
can_bus[13:16] = -tick_data['angular_velocity']
can_bus[16] = ego_theta
can_bus[17] = ego_theta / np.pi * 180 
results['can_bus'] = can_bus
ego_lcf_feat = np.zeros(9)
ego_lcf_feat[0:2] = can_bus[0:2].copy()
ego_lcf_feat[2:4] = can_bus[10:12].copy()
ego_lcf_feat[4] = rotation[-1]
ego_lcf_feat[5] = 4.89238167
ego_lcf_feat[6] = 1.83671331
ego_lcf_feat[7] = np.sqrt(can_bus[0]**2+can_bus[1]**2)
```

然后调用模型输出 自车的航点

```plain
all_out_truck_d1 = output_data_batch[0]['pts_bbox']['ego_fut_preds'].cpu().numpy()
all_out_truck =  np.cumsum(all_out_truck_d1,axis=1)
out_truck = all_out_truck[command]
# shape = (6, 2)  VAD输出的轨迹
steer_traj, throttle_traj, brake_traj, metadata_traj = self.pidcontroller.control_pid(out_truck, tick_data['speed'], local_command_xy)
# 转换为控制信号如：steer 方向盘, throttle 油门, brake 刹车, 
if brake_traj < 0.05: brake_traj = 0.0
if throttle_traj > brake_traj: brake_traj = 0.0
```

所输出的meta轨迹为：

```plain
{'speed': 8.26137995352502e-05, 
'steer': -0.0017652750561951065, 
'throttle': 0.75, 
'brake': 0.0, 
'wp_4': (-0.05061296373605728, 13.20882797241211), 
'wp_3': (-0.03256780281662941, 9.291003227233887), 
'wp_2': (-0.01940338686108589, 5.603672027587891), 
'wp_1': (-0.006157626397907734, 2.3732500076293945), 
'aim': (-0.006157626397907734, 2.3732500076293945), 
'target': (-0.5961767744741979, 53.63156382923191), 
'desired_speed': 7.6214276313781735, 
'angle': -0.001651719350825831, 
'angle_last': -0.0039027220282897, 
'angle_target': -0.00707647257491845, 
'angle_final': -0.001651719350825831, 
'delta': 0.25}
```

ss

```plain
control = carla.VehicleControl()
self.pid_metadata = metadata_traj
self.pid_metadata['agent'] = 'only_traj'
control.steer = np.clip(float(steer_traj), -1, 1)
control.throttle = np.clip(float(throttle_traj), 0, 0.75)
control.brake = np.clip(float(brake_traj), 0, 1)     
self.pid_metadata['steer'] = control.steer
self.pid_metadata['throttle'] = control.throttle
self.pid_metadata['brake'] = control.brake
self.pid_metadata['steer_traj'] = float(steer_traj)
self.pid_metadata['throttle_traj'] = float(throttle_traj)
self.pid_metadata['brake_traj'] = float(brake_traj)
self.pid_metadata['plan'] = out_truck.tolist()
self.pid_metadata['command'] = command
self.pid_metadata['all_plan'] = all_out_truck.tolist()

metric_info = self.get_metric_info()
self.metric_info[self.step] = metric_info
if SAVE_PATH is not None and self.step % 1 == 0:
   self.save(tick_data)
self.prev_control = control
if len(self.prev_control_cache)==10:
   self.prev_control_cache.pop(0)
self.prev_control_cache.append(control)
```

最后会将上述驾驶命令control 打包为<carla.libcarla.VehicleControl object at 0x7efe9a1ae930> 并操控自我车辆进行控制



> 更新: 2024-12-13 16:39:36  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/di2shc47oxhq67ih>