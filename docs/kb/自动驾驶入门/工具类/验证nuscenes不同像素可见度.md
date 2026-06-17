# 验证nuscenes不同像素可见度

<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);"></font><code><font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">visibility</font></code><font style="color:rgb(77, 77, 77);"> 被定义为在6个摄像头输入中可见的特定注释的像素比例，分为4个组别。</font>

<font style="color:rgb(77, 77, 77);"></font>

```plain
[{'description': 'visibility of whole object is between 0 and 40%',
  'token': '1',
  'level': 'v0-40'},
 {'description': 'visibility of whole object is between 40 and 60%',
  'token': '2',
  'level': 'v40-60'},
 {'description': 'visibility of whole object is between 60 and 80%',
  'token': '3',
  'level': 'v60-80'},
 {'description': 'visibility of whole object is between 80 and 100%',
  'token': '4',
  'level': 'v80-100'}]
```

注意，visibility\_token是sample的anns的属性，不是sample的属性。

一个获取visibility\_token的例子如下。

```python
anntoken = 'a7d0722bce164f88adf03ada491ea0ba'
visibility_token = nusc.get('sample_annotation', anntoken)['visibility_token']

print("Visibility: {}".format(nusc.get('visibility', visibility_token)))
nusc.render_annotation(anntoken)
```

<font style="color:rgb(77, 77, 77);">修改anaconda3/envs/fgf/lib/python3.9/site-packages/nuscenes/eval/common/loaders.py下的load\_gt函数，实现验证nus的不同可见度的box。</font>

<font style="color:rgb(77, 77, 77);"></font>

<font style="color:rgb(77, 77, 77);">原理：每个sample加载gt box的时候进行筛选。test的时候，看最终筛选出来的box数量可以验证对错。sample本身的筛选逻辑没改。</font>

<font style="color:rgb(77, 77, 77);"></font>

```python
def load_gt(nusc: NuScenes, eval_split: str, box_cls, verbose: bool = False) -> EvalBoxes:
    """
    Loads ground truth boxes from DB.
    :param nusc: A NuScenes instance.
    :param eval_split: The evaluation split for which we load GT boxes.
    :param box_cls: Type of box to load, e.g. DetectionBox or TrackingBox.
    :param verbose: Whether to print messages to stdout.
    :return: The GT boxes.
    """
    # Init.
    if box_cls == DetectionBox:
        attribute_map = {a['token']: a['name'] for a in nusc.attribute}

    if verbose:
        print('Loading annotations for {} split from nuScenes version: {}'.format(eval_split, nusc.version))
    # Read out all sample_tokens in DB.
    sample_tokens_all = [s['token'] for s in nusc.sample]
    assert len(sample_tokens_all) > 0, "Error: Database has no samples!"

    # Only keep samples from this split.
    splits = create_splits_scenes()

    # Check compatibility of split with nusc_version.
    version = nusc.version
    if eval_split in {'train', 'val', 'train_detect', 'train_track'}:
        assert version.endswith('trainval'), \
            'Error: Requested split {} which is not compatible with NuScenes version {}'.format(eval_split, version)
    elif eval_split in {'mini_train', 'mini_val'}:
        assert version.endswith('mini'), \
            'Error: Requested split {} which is not compatible with NuScenes version {}'.format(eval_split, version)
    elif eval_split == 'test':
        assert version.endswith('test'), \
            'Error: Requested split {} which is not compatible with NuScenes version {}'.format(eval_split, version)
    else:
        raise ValueError('Error: Requested split {} which this function cannot map to the correct NuScenes version.'
                         .format(eval_split))

    if eval_split == 'test':
        # Check that you aren't trying to cheat :).
        assert len(nusc.sample_annotation) > 0, \
            'Error: You are trying to evaluate on the test set but you do not have the annotations!'

    sample_tokens = []
    for sample_token in sample_tokens_all:
        scene_token = nusc.get('sample', sample_token)['scene_token']
        scene_record = nusc.get('scene', scene_token)
        if scene_record['name'] in splits[eval_split]:
            sample_tokens.append(sample_token)

    all_annotations = EvalBoxes()
    
    # visibility_token_filter=['1','2','3','4']
    visibility_token_filter=['4']

    # Load annotations and filter predictions and annotations.
    tracking_id_set = set()
    for sample_token in tqdm.tqdm(sample_tokens, leave=verbose):

        sample = nusc.get('sample', sample_token)
        sample_annotation_tokens = sample['anns']

        sample_boxes = []
        for sample_annotation_token in sample_annotation_tokens:

            sample_annotation = nusc.get('sample_annotation', sample_annotation_token)
            
            if box_cls == DetectionBox:
                
                # Get label name in detection task and filter unused labels.
                detection_name = category_to_detection_name(sample_annotation['category_name'])
                if detection_name is None:
                    continue
                # 按照visibility_token筛选
                if sample_annotation['visibility_token'] not in visibility_token_filter:
                    continue

                # Get attribute_name.
                attr_tokens = sample_annotation['attribute_tokens']
                attr_count = len(attr_tokens)
                if attr_count == 0:
                    attribute_name = ''
                elif attr_count == 1:
                    attribute_name = attribute_map[attr_tokens[0]]
                else:
                    raise Exception('Error: GT annotations must not have more than one attribute!')

                sample_boxes.append(
                    box_cls(
                        sample_token=sample_token,
                        translation=sample_annotation['translation'],
                        size=sample_annotation['size'],
                        rotation=sample_annotation['rotation'],
                        velocity=nusc.box_velocity(sample_annotation['token'])[:2],
                        num_pts=sample_annotation['num_lidar_pts'] + sample_annotation['num_radar_pts'],
                        detection_name=detection_name,
                        detection_score=-1.0,  # GT samples do not have a score.
                        attribute_name=attribute_name
                    )
                )
            elif box_cls == TrackingBox:
                # Use nuScenes token as tracking id.
                tracking_id = sample_annotation['instance_token']
                tracking_id_set.add(tracking_id)

                # Get label name in detection task and filter unused labels.
                # Import locally to avoid errors when motmetrics package is not installed.
                from nuscenes.eval.tracking.utils import category_to_tracking_name
                tracking_name = category_to_tracking_name(sample_annotation['category_name'])
                if tracking_name is None:
                    continue

                sample_boxes.append(
                    box_cls(
                        sample_token=sample_token,
                        translation=sample_annotation['translation'],
                        size=sample_annotation['size'],
                        rotation=sample_annotation['rotation'],
                        velocity=nusc.box_velocity(sample_annotation['token'])[:2],
                        num_pts=sample_annotation['num_lidar_pts'] + sample_annotation['num_radar_pts'],
                        tracking_id=tracking_id,
                        tracking_name=tracking_name,
                        tracking_score=-1.0  # GT samples do not have a score.
                    )
                )
            else:
                raise NotImplementedError('Error: Invalid box_cls %s!' % box_cls)
        
        all_annotations.add_boxes(sample_token, sample_boxes)

    if verbose:
        print("Loaded ground truth annotations for {} samples.".format(len(all_annotations.sample_tokens)))
    
    return all_annotations
```

<font style="color:rgb(77, 77, 77);"></font>


> 更新: 2025-01-10 18:57:55  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/zakopo5zcnq60k0a>