# Open3d可视私有点云数据集（合众汽车数据集）

```python
import pickle
import cv2
from collections import defaultdict
import numpy as np
import os
import open3d as o3d
from scipy.spatial.transform import Rotation as R

def load_imu_data(file_path):
    # 从文件中读取 IMU 数据
    time_pose ={}
    with open(file_path, 'r', encoding='utf-8') as obj:
        for line in obj.readlines():
            li = line.rstrip('\n').split()
            for ii in range(len(li)):
                if ii == 0:
                    time_pose[li[ii]] = []
                else:
                    time_pose[li[0]].append(float(li[ii]))

    return time_pose


def load_gt_data(file_path):
    # 从文件中读取 IMU 数据
    gt_3dbbox ={}
    with open(file_path, 'r', encoding='utf-8') as obj:
        for line in obj.readlines():
            li = line.rstrip('\n').split()
            for ii in range(len(li)):
                if ii == 0:
                    if li[0] not in gt_3dbbox.keys():
                        gt_3dbbox[li[0]] = []
                    gt_3dbbox[li[0]].append([])
                else:
                    gt_3dbbox[li[0]][-1].append(float(li[ii]))

    return gt_3dbbox

def create_3d_box(size, center, rotation_angle, color=(1,0,0)):
    # 创建一个 3D 框
    box = o3d.geometry.OrientedBoundingBox()
    box.extent = np.array(size)  # dx, dy, dz
    box.center = np.array(center)  # x, y, z
    R = box.get_rotation_matrix_from_xyz([0, 0, rotation_angle])
    box.color = color
    box.rotate(R, box.center)
    return box




def vis_one_pcd(pcdfile, gtfile, timestep, posefile):
    # pcdfile = '1687969411589391708.pcd'
    # gtfile = '1687969411589391708.txt'
    # timestep = '1687969411589391708'
    # posefile = 'global_imu_pose.txt'
    print(pcdfile)
    time_pose = load_imu_data(posefile)
    print(len(time_pose))
    pose = time_pose[timestep]
    print(pose)

    colors = {'smallvehicle': (1, 0, 0), 'bigvehicle': (0, 1, 0), 'bicyclist': (0, 0, 1)}

    pcd_old = o3d.io.read_point_cloud(pcdfile)
    points = np.asarray(pcd_old.points)

    # 设置您希望移除点的阈值
    threshold = 100  # 示例阈值

    # 移除过大的点
    print(len(points), points[:, :2].shape)
    filtered_points = points[np.linalg.norm(points[:, :2], axis=1) < threshold]

    # 创建新的点云
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(filtered_points)
    print(len(pcd.points))

    gt_3dbbox = load_gt_data(gtfile)
    # print(len(gt_3dbbox))
    print(gt_3dbbox.keys())
    print(gt_3dbbox['smallvehicle'][0])
    bboxs = []
    for name, labels in gt_3dbbox.items():
        cc = colors.get(name, (0, 1, 1))
        for ll in labels:
            dx, dy, dz = ll[7], ll[8], ll[9]
            x, y, z = ll[10], ll[11], ll[12] + dz / 2
            rotation_angle = ll[13]
            object_size = [dx, dy, dz]
            object_center = [x, y, z]
            rotation_angle = -rotation_angle

            bboxs.append(create_3d_box(object_size, object_center, rotation_angle, color=cc))

    # 计算所有点到原点的距离
    points = np.asarray(pcd.points)
    distances = np.linalg.norm(points, axis=1)

    # 根据距离设置颜色
    colors = np.zeros(points.shape)
    # colors[:, 1] = 2*distances / np.max(distances) # 红色分量
    # colors[:, 1][colors[:, 1]>1] =1
    # colors[:, 2] = (1 - colors[:, 1])*2  # 蓝色分量
    # colors[:, 2][colors[:, 2] > 1] = 1
    colors += 0.9
    pcd.colors = o3d.utility.Vector3dVector(colors)
    # print(pcd.colors)

    o3d.visualization.draw_geometries([pcd, *bboxs])

    # vis = o3d.visualization.Visualizer()
    # vis.create_window(visible=False)  # 设置 visible=False 来防止窗口显示
    # render_option = vis.get_render_option()
    # render_option.point_size = 1  # 设置点的大小
    # vis.add_geometry(pcd)
    # for bbox in bboxs:
    #     vis.add_geometry(bbox)
    #
    # vis.poll_events()
    # vis.update_renderer()
    #
    # vis.capture_screen_image("screenshot.png")
    #
    # # 销毁视窗
    # vis.destroy_window()


if __name__ == '__main__':

    data_root = 'data_20231116\city\EP40-PVS-42_EP40_MDC_0930_1215_2023-06-28-16-23-27_0.bag\label_file'

    for rt, dirs, files in os.walk(data_root):
        files = sorted(files)
        for file in files:
            if not file.endswith('.pcd'):
                continue
            pcdfile = os.path.join(rt, file)
            timestep = rt.split('\\')[-1]
            gtfile = rt.replace('label_file', 'label_gt_txt') + '.txt'
            posefile = os.path.join('\\'.join(rt.split('\\')[:-2]), "global_imu_pose.txt")

            # print(pcdfile)
            # print(timestep)
            # print(gtfile)
            # print(posefile)
            if not os.path.exists(gtfile):
                continue

            for rt_, dirs_, files_ in os.walk(rt):
                files_ = sorted(files_)
                name = None
                for file_ in files_:
                    if file_.endswith('.pcd'):
                        continue
                    if name is None:
                        name = file_
                    if '-71-' in file_:
                        name = file_
                print(os.path.join(rt_, name), os.path.exists(os.path.join(rt_, name)))
                img = cv2.imread(os.path.join(rt_, name))
                print(img.shape)
                img = cv2.resize(img, (img.shape[1]//4, img.shape[0]//4))
                print(name, img.shape)
                cv2.imshow(name, img)
                cv2.waitKey(1)
                    # break
            vis_one_pcd(pcdfile, gtfile, timestep, posefile)
```

数据集说明

[附件: 数据格式说明.docx](./attachments/yupjhQWUJW8v9sSF/数据格式说明.docx)

数据集链接（只提供了部分的）

链接：[https://pan.baidu.com/s/1sd2BiS-JCo14xAM89jOD5w?pwd=1234](https://pan.baidu.com/s/1sd2BiS-JCo14xAM89jOD5w?pwd=1234) 

提取码：1234 

--来自百度网盘超级会员V6的分享



> 更新: 2023-11-23 22:03:54  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/hftodp5dle6zpfvq>