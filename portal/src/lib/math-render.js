// Render automático de fórmulas: detecta $...$ inline y $$...$$ bloque
// dentro de un elemento DOM y los reemplaza por KaTeX renderizado.

import katex from 'katex';
import 'katex/dist/katex.min.css';

const SYMBOL_MAP = {
  '∑': '\\sum', '∏': '\\prod', '∫': '\\int',
  '∞': '\\infty', '∂': '\\partial', '∇': '\\nabla',
  '∈': '\\in', '∉': '\\notin', '⊂': '\\subset',
  '∪': '\\cup', '∩': '\\cap', '∅': '\\emptyset',
  '≤': '\\leq', '≥': '\\geq', '≠': '\\neq',
  '≈': '\\approx', '≡': '\\equiv', '∝': '\\propto',
  '·': '\\cdot', '×': '\\times', '÷': '\\div',
  '±': '\\pm', '√': '\\sqrt',
  'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma',
  'δ': '\\delta', 'ε': '\\varepsilon', 'θ': '\\theta',
  'λ': '\\lambda', 'μ': '\\mu', 'π': '\\pi',
  'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau',
  'φ': '\\varphi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
  'Σ': '\\Sigma', 'Δ': '\\Delta', 'Π': '\\Pi',
  'Ω': '\\Omega', 'Φ': '\\Phi'
};

export function renderMath(element) {
  if (!element) return;

  // Recorre los nodos de texto y reemplaza $...$/$$...$$ por KaTeX
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent || !node.textContent.includes('$')) return NodeFilter.FILTER_REJECT;
      // No tocar nodos dentro de KaTeX, ni dentro de <code>/<pre>/<textarea>
      let p = node.parentElement;
      while (p) {
        const tag = p.tagName?.toLowerCase();
        if (p.classList?.contains('katex')) return NodeFilter.FILTER_REJECT;
        if (tag === 'code' || tag === 'pre' || tag === 'textarea' || tag === 'script' || tag === 'style') {
          return NodeFilter.FILTER_REJECT;
        }
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);

  for (const textNode of nodes) {
    let html = textNode.textContent;
    // Display mode primero ($$...$$)
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (m, formula) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false, output: 'html' });
      } catch { return m; }
    });
    // Inline ($...$)
    html = html.replace(/\$([^$\n]+?)\$/g, (m, formula) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false, output: 'html' });
      } catch { return m; }
    });

    if (html !== textNode.textContent) {
      const wrapper = document.createElement('span');
      wrapper.innerHTML = html;
      textNode.replaceWith(wrapper);
    }
  }
}

export function renderFormula(latex, displayMode = true) {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, output: 'html' });
  } catch (e) {
    console.warn('KaTeX error:', latex, e?.message);
    return `<code class="formula-fallback">${escapeHtml(latex)}</code>`;
  }
}

export function autoLatex(text) {
  if (!text) return text;
  let result = String(text);
  for (const [from, to] of Object.entries(SYMBOL_MAP)) {
    result = result.split(from).join(to);
  }
  result = result
    .replace(/\b([A-Za-z])\^(\d+)/g, '$1^{$2}')
    .replace(/\b([A-Za-z])_(\w+)/g, '$1_{$2}')
    .replace(/(\w+)\s*\/\s*(\w+)/g, '\\frac{$1}{$2}');
  return result;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
