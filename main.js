document.addEventListener('DOMContentLoaded', () => {
    const fileInput    = document.getElementById('csv-upload');
    const searchInput  = document.getElementById('search-input');
    const yearFilter   = document.getElementById('year-filter');
    const gakkaFilter  = document.getElementById('gakka-filter');
    const genderFilter = document.getElementById('gender-filter');
    const tableHeader  = document.getElementById('table-header');
    const tableBody    = document.getElementById('table-body');
    const totalCountEl = document.getElementById('total-count');
    const maleCountEl  = document.getElementById('male-count');
    const femaleCountEl = document.getElementById('female-count');

    let allData = [];
    let headers = [];

    // 表示する列（産業分類・職業分類の生コードは非表示、名称列を使用）
    const DISPLAY_COLS = [
        '年度', '生徒番号', '性別', '学科', '事業所名',
        '就業先の都道府県名', '就業先所在地', '求人番号',
        '産業分類名', '職業分類名', '従業員の規模', '紹介経路'
    ];

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                allData = results.data;
                headers = results.meta.fields;
                initFilters();
                applyFilters();
            },
        });
    });

    function initFilters() {
        const years = [...new Set(allData.map(r => r['年度']))].sort().reverse();
        yearFilter.innerHTML = '<option value="">全ての年度</option>' +
            years.map(y => `<option value="${y}">${y}年度</option>`).join('');

        const gakkas = [...new Set(allData.map(r => r['学科']).filter(Boolean))].sort();
        gakkaFilter.innerHTML = '<option value="">全ての学科</option>' +
            gakkas.map(g => `<option value="${g}">${g}</option>`).join('');
    }

    function getFiltered() {
        const year   = yearFilter.value;
        const gakka  = gakkaFilter.value;
        const gender = genderFilter.value;
        const term   = searchInput.value.toLowerCase().trim();

        return allData.filter(row => {
            if (year   && row['年度'] !== year)   return false;
            if (gakka  && row['学科'] !== gakka)  return false;
            if (gender && row['性別'] !== gender) return false;
            if (term   && !Object.values(row).some(v => String(v).toLowerCase().includes(term))) return false;
            return true;
        });
    }

    function applyFilters() {
        const data = getFiltered();
        updateSummary(data);
        renderTable(data);
    }

    function updateSummary(data) {
        totalCountEl.textContent  = data.length;
        maleCountEl.textContent   = data.filter(r => r['性別'] === '男').length;
        femaleCountEl.textContent = data.filter(r => r['性別'] === '女').length;
    }

    function renderTable(data) {
        const cols = DISPLAY_COLS.filter(c => headers.includes(c));

        tableHeader.innerHTML = cols.map(h => `<th>${h}</th>`).join('');

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${cols.length || 1}" class="empty-state">データが見つかりません</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(row =>
            `<tr>${cols.map(h => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`
        ).join('');
    }

    yearFilter.addEventListener('change', applyFilters);
    gakkaFilter.addEventListener('change', applyFilters);
    genderFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
});
