# 贡献统计

<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const data = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    const res = await fetch(withBase('/contributors.json'))
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    data.value = await res.json()
  } catch (err) {
    error.value = err?.message || String(err)
  }
})

const contributors = computed(() => data.value?.contributors || [])
</script>

<div v-if="error" class="contrib-error">贡献统计加载失败：{{ error }}</div>

<div v-else-if="!data" class="contrib-loading">正在加载贡献统计...</div>

<div v-else class="contrib-page">
  <div class="contrib-metrics">
    <div class="contrib-metric">
      <div class="contrib-metric-value">{{ data.totals.contributors }}</div>
      <div class="contrib-metric-label">贡献者</div>
    </div>
    <div class="contrib-metric">
      <div class="contrib-metric-value">{{ data.totals.files }}</div>
      <div class="contrib-metric-label">文件</div>
    </div>
    <div class="contrib-metric">
      <div class="contrib-metric-value">{{ data.totals.lines }}</div>
      <div class="contrib-metric-label">行数</div>
    </div>
    <div class="contrib-metric">
      <div class="contrib-metric-value">{{ Math.round(data.totals.bytes / 1024 / 1024) }}</div>
      <div class="contrib-metric-label">MB</div>
    </div>
  </div>

  <h2>上传者贡献排行</h2>
  <div class="contrib-table-wrap">
    <table>
      <thead>
        <tr>
          <th>上传者</th>
          <th>文件</th>
          <th>行数</th>
          <th>大小</th>
          <th>识别来源</th>
          <th>最近更新</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in contributors" :key="`${item.name}-${item.email}`">
          <td>
            <strong>{{ item.name }}</strong>
            <div class="contrib-muted">{{ item.email }}</div>
          </td>
          <td>{{ item.files }}</td>
          <td>{{ item.lines }}</td>
          <td>{{ Math.round(item.bytes / 1024) }} KB</td>
          <td>{{ Object.keys(item.sourceCounts || {}).join(' / ') }}</td>
          <td>{{ item.lastFileAt?.slice(0, 10) || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>样例文件</h2>
  <div class="contrib-recent">
    <div v-for="item in contributors" :key="`${item.name}-samples`" class="contrib-commit">
      <strong>{{ item.name }}</strong>
      <span>{{ item.samples.join('、') }}</span>
    </div>
  </div>

  <p class="contrib-muted">统计范围：{{ data.targets.join('、') }}。识别方式：{{ data.method }}。生成时间：{{ data.generatedAt }}</p>
</div>
