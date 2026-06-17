# GPT4V API调用demo（给图实现描述）

```python
from openai import OpenAI
import openai
from PIL import Image
import imghdr
import base64
import io
import argparse
import multiprocessing
import os
import json
import time
import numpy as np
from io import BytesIO
import cv2
import random
from collections import defaultdict
import concurrent.futures

import re

# from aoss_client.client import Client
# conf_path = '/mnt/afs/user/chenzixuan/aoss.conf'
# client = Client(conf_path)

def one_ask(client,text,image_paths,image_size=(512,512),detail='low'): # 没必要小于512，因为gpt只对大于512额外收费。此外，low设置下GPT会自行改大小至512
    content=[]
    
    content.append({"type": "text", "text": text})
    for image in image_paths:
        # 使用imghdr模块检测图片类型：
        image_type = imghdr.what(image)
        if image_type not in ['png','jpeg']:
            # TODO:考虑把是否要把其它类型的图片转化为可行格式 
            continue
        
        with Image.open(image) as img:
            # 如果图片的任一边大于最大尺寸
            if img.size[0] > image_size[0] or img.size[1] > image_size[1]:
                # 按比例缩小图片
                img.thumbnail(image_size, Image.LANCZOS)
            
            # 将图片保存到一个字节流对象中，准备编码为base64
            byte_stream = io.BytesIO()
            # 假设图片格式为JPEG，可以根据实际情况修改或者通过img.format获取
            img.save(byte_stream, format="JPEG")
            
            # 将字节流编码为base64
            encoded_string = base64.b64encode(byte_stream.getvalue()).decode('utf-8')

        img_src_attr_value = f'data:image/{image_type};base64,{encoded_string}'

        content.append({"type": "image_url", "image_url": {"url":img_src_attr_value,"detail": detail}})

    # import pdb;pdb.set_trace()
    # print(content)
    try:
        response=client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[{"role": "user","content": content}],
            max_tokens=4096
        )
    except Exception as e:
        print("error e",e)
    print(response)
    return response.choices[0]


def ask_gpt(query_list,api_key):

    client = OpenAI(api_key=api_key)
    for query in query_list:
        try:
            res=one_ask(client,query[0],query[1])
            # ipdb.set_trace()
            data = defaultdict()
            data['img_path'] = query[1]
            data['prompt'] = query[0]
            data['gpt4v_caption'] = res.message.content
            print(query[0])
            print(res)
            # print(data['gpt4v_caption'])
            if "抱歉" in data['gpt4v_caption']:
                continue
            json_line = json.dumps(data, ensure_ascii=False)
            result_file.write(json_line +  '\n')
            result_file.flush()
            time.sleep(30)
        # print(f"进程 {num} 正在执行，进程ID为：{os.getpid()}")
        
        except openai.InternalServerError as e:
            if e.status_code in [502,503]:
                print(e.status_code)
            else:
                print(e)
            time.sleep(10)
        except openai.RateLimitError as e:
            if e.status_code==429:
                if 'RPD' in e.message:
                    print('RPD')
                if 'TPM' in e.message:
                    print(' wait for 1 minute')
                    time.sleep(60)
                print('e.status_code==429')
            elif e.status_code==400:
                print(400)
            else:
                print(e)

def ask_gpt_fuction(img_to_process, api_key,prompts):
    prompt = random.sample(prompts, 1)[0]
    # import pdb; pdb.set_trace()
    # prompt='请忽略图中的具体人物,用中文详细描述图中的行为。包括周边环境，手部动作，面部表情，身体姿势等，每张图的描述大约在300字左右'
    for img_path in img_to_process:

        prompt = prompt.replace("[ ]", img_path.split('/')[-2])


        # import pdb; pdb.set_trace()
        ask_gpt([(prompt,[img_path])],api_key)


def parse_args():
    parser = argparse.ArgumentParser(description='Beta')
    parser.add_argument('-i', '--json_file', type=str, help='json file',
                        required=True)
    parser.add_argument('-r', '--result_file', type=str, help='输出文件路径', required=True)
    # parser.add_argument('-a', '--api_index', type=int, help='api index', required=True)
    args = parser.parse_args()
    return args


if __name__=='__main__':
    root_path = "/mnt/afs/user/songziying/workspace/crawler_GPT4V/food-101/images"
    args = parse_args()
    api_key_list1=[
        'c2stSFVUS016c2JDRkoxZkt3UE1GQ0FUM0JsYmtGSnNkbFRvTUYyYWpOSjZpalljblhq',
        'c2stSjNUYmlpSm1LWFFudnJGdVI5bFJUM0JsYmtGSkJ6OURFT2w1dnZOeHdmRDBpdjRw',
        'c2stdkVLZ1N4WVIzaWs4aHFKZkdwOHJUM0JsYmtGSmR3UmFROWg0VnVadHVqalM0MDJi',
        'c2stTUs1VkhJa1pyR29Hb0dEckxTOExUM0JsYmtGSkt4djRxcUVnT01peWVIdDU1bDVM',
        'c2stUWljTmFybTFFRlBYZExRU1RsVkdUM0JsYmtGSkNIWThWSnB3SFNpNENza0lST3U3',
       
    ]


    json_file = args.json_file
    result_file = args.result_file
    
    exist_dict = defaultdict()
    if os.path.exists(result_file):
        result_file_ = open(result_file, 'r', encoding='utf-8').readlines()
        start_line = len(result_file_)
        print('we start from ', start_line, 'to generate caption')

        for line in result_file_:
            xx = json.loads(line)
            img_path = xx['img_path'][0]
            exist_dict[img_path] = 1

    start_line = 0

    result_file = open(result_file, 'a', encoding='utf-8')
    jsons_f=open(json_file, 'r', encoding='utf-8').readlines()
    prompt_filename = 'prompt.txt'
    prompts = open(prompt_filename, 'r', encoding='utf-8').readlines()
    
    start = start_line 
    print(start ,' datas have been done')

    data_to_process = []

    for index in range(start, len(jsons_f)):
        line = jsons_f[index]
        
        data = json.loads(line)
        # print("data",data)
        for key, value in data.items():

            if isinstance(value, list):  # 检查值是否为列表
                data[key] = [root_path+'/' + item + ".jpg" if isinstance(item, str) else item for item in value]

        img_path = data
        img_path = list(data.values())
        # if not os.path.exists(img_path):
        #     print('img not exists ', img_path)
        # if img_path in exist_dict.keys():
        #     continue
        
        img_path = [item for sublist in img_path for item in (sublist if isinstance(sublist, list) else [sublist])]
        data_to_process=img_path

    num_thread = len(api_key_list1)
    per_thread_data = int(len(data_to_process)/num_thread)

    # prompt='请忽略图中的具体人物,用中文详细描述图中的着装。着装包括以下方面，着装的类型、颜色、材质，款式和设计，人物的发型等，每张图的描述大约在300字左右'#，1.##### 2.#####' # 3.##### 4.#####'
    # prompt='请忽略图中的具体人物,用中文详细描述图中的行为。包括周边环境，手部动作，面部表情，身体姿势等，每张图的描述大约在300字左右'#，1.##### 2.#####' # 3.##### 4.#####'
    # prompt = random.sample(][], 1)[0]
    with concurrent.futures.ThreadPoolExecutor() as executor:
            # 提交任务
        for i in range(num_thread):
            
            per_task_data = data_to_process[i*per_thread_data:(i+1)*per_thread_data]

            future = executor.submit(ask_gpt_fuction, per_task_data , api_key_list1[i],prompts)
```

输入下面的代码块，就能在调用GPT4V

```plain
python gpt4_caption.py -i /mnt/afs/user/songziying/workspace/crawler_GPT4V/food-101/meta/test.json -r ./result.json
```



使用GPT4V需要挂的代理

 export http_proxy=http://fvgroup:48423590@10.54.0.93:3128  
export https_proxy=http://fvgroup:48423590@10.54.0.93:3128  
export HTTP_PROXY=http://fvgroup:48423590@10.54.0.93:3128  
export HTTPS_PROXY=http://fvgroup:48423590@10.54.0.93:3128  



> 更新: 2023-12-13 21:47:38  
> 原文: <https://3dcv.yuque.com/org-wiki-3dcv-mm1l0t/ysgfp9/brdc002s6f71rowg>