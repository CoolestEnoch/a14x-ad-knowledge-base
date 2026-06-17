# MambaAD？相关实验与报告

针对原始规划头中历史信息融合不稳定、轨迹修正不连续的问题，

提出了一个 SSM-Flow 增强的规划 refinement 框架。



我的创新点：

1. 我们提出了一种命令感知的选择性状态空间规划 query 融合模块。  
该模块将历史 planning query 和当前 planning query 组织为状态序列，  
通过 SSM 学习规划意图的时间演化，并仅在场景连续且驾驶指令一致时注入历史信息。
2. 我们设计了一种可靠性门控的残差式历史状态注入机制。  
通过 global gate 和 mode-wise gate，自适应控制不同规划 mode 对历史状态的依赖，  
从而减少错误历史信息对当前规划的负迁移。
3. 我们引入了一种基于 Flow Matching 的轨迹残差修正头。  
该模块以refined trajectory 为初始轨迹，  
学习其到专家轨迹的连续修正向量场，  
在保持原 anchor-based planner 稳定性的同时进一步提升轨迹精度和平滑性。



目前在进行Navsim实验，常用的代码：

tmux使用（解决训练时服务器不稳定的问题）

新建端口：

tmux new -s mamba_nav

查看训练：

tmux attach -t mamba_nav

检查状态：

tmux ls

训练结束后：tmux kill-session -t mamba_nav

激活环境：

conda activate diffusiondrive_navsim_env 

查看gpu使用情况：gpustat

训练代码：

```plain
python $NAVSIM_DEVKIT_ROOT/planning/script/run_training.py \
        agent=mambaad_agent \
        experiment_name=debug_mambaad_agent \
        train_test_split=navtrain \
        split=trainval \
        trainer.params.max_epochs=1 \
        cache_path="${NAVSIM_EXP_ROOT}/training_cache/" \
        use_cache_without_dataset=True \
        force_cache_computation=False
```

强制使用卡：

CUDA_VISIBLE_DEVICES=0,1,2,3

整体：

```plain
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5 python $NAVSIM_DEVKIT_ROOT/planning/script/run_training.py \
        agent=mambaad_agent \
        experiment_name=training_mambaad_agent_v2 \
        train_test_split=navtrain \
        split=trainval \
        trainer.params.max_epochs=100 \
        cache_path="${NAVSIM_EXP_ROOT}/training_cache/" \
        use_cache_without_dataset=True \
        force_cache_computation=False
```

训练完后会ckpt保存在大目录下exp文件中：例如： /data/songziying/workspace/DiffusionDrive_NAVSIM/DiffusionDrive/exp/training_mambaad_agent/2026.06.02.17.56.42/lightning_logs/version_0/checkpoints/epoch=99-step=33300.ckpt  

测试代码：

```plain
python $NAVSIM_DEVKIT_ROOT/navsim/planning/script/run_pdm_score.py \
        train_test_split=navtest \
        agent=mambaad_agent \
        worker=ray_distributed \
        agent.checkpoint_path=$CKPT \
        experiment_name=diffusiondrive_agent_eval
```

这个代码要把$CKPT替换成自己训练好的ckpt路径，如果名字中出现=要用以下方式的软链接

整体版：

```plain
cd /data/songziying/workspace/DiffusionDrive_NAVSIM/DiffusionDrive

CKPT_SRC="/data/songziying/workspace/DiffusionDrive_NAVSIM/DiffusionDrive/exp/training_mambaad_agent_v2/2026.06.05.16.05.10/lightning_logs/version_0/checkpoints/epoch=99-step=22200.ckpt"

CKPT_LINK="/data/songziying/workspace/DiffusionDrive_NAVSIM/DiffusionDrive/exp/training_mambaad_agent_v2/mambaad_epoch99_step22200.ckpt"

ln -sf "$CKPT_SRC" "$CKPT_LINK"

CUDA_VISIBLE_DEVICES=0,1,2,3 python $NAVSIM_DEVKIT_ROOT/planning/script/run_pdm_score.py \
  train_test_split=navtest \
  agent=mambaad_agent \
  worker=ray_distributed \
  agent.checkpoint_path="$CKPT_LINK" \
  experiment_name=mambaad_agent_epoch99_navtest

```



> 更新: 2026-06-06 12:25:15  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/fi3p5p/gv6k0shosmi9rwya>