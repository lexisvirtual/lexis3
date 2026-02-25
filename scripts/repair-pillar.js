const fs = require('fs');
const path = require('path');

async function repairGitHubFile() {
    const filePath = 'src/pages/PilarIntensivo.jsx';
    const localPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(localPath, 'utf8');

    const owner = 'lexisvirtual';
    const repo = 'lexis3';
    const branch = 'main';
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.error('GITHUB_TOKEN not found in env');
        return;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // Get current SHA
    const checkRes = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'LexisRepair/1.0'
        }
    });

    let sha = null;
    if (checkRes.ok) {
        const fileData = await checkRes.json();
        sha = fileData.sha;
    }

    const body = {
        message: 'fix(pages): restore PilarIntensivo.jsx from local backup',
        content: Buffer.from(content).toString('base64'),
        branch,
        sha
    };

    const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'LexisRepair/1.0'
        },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        console.log('✅ File restored on GitHub');
    } else {
        const err = await res.text();
        console.error('❌ Failed to restore file:', err);
    }
}

repairGitHubFile();
