import ast
import difflib
import re
from typing import Dict, Any, List, Optional, Tuple

class DiffEngine:
    """
    Minimal Token Diff Synthesizer & Patch Validator.
    Instead of regenerating entire files (which consumes thousands of expensive completion tokens),
    Axiom produces minimal search-replace blocks or unified diffs, verifies AST syntax,
    and applies changes atomically.
    """

    @staticmethod
    def generate_unified_diff(original_code: str, modified_code: str, filename: str = "solution.py") -> str:
        """Produces standard unified diff string."""
        orig_lines = original_code.splitlines(keepends=True)
        mod_lines = modified_code.splitlines(keepends=True)

        diff = difflib.unified_diff(
            orig_lines,
            mod_lines,
            fromfile=f"a/{filename}",
            tofile=f"b/{filename}",
            n=3
        )
        return "".join(diff)

    @staticmethod
    def get_diff_stats(original_code: str, modified_code: str) -> Dict[str, Any]:
        """Calculates line diff statistics and structured changes for UI visualization."""
        orig_lines = original_code.splitlines()
        mod_lines = modified_code.splitlines()

        matcher = difflib.SequenceMatcher(None, orig_lines, mod_lines)
        added = 0
        removed = 0
        changes: List[Dict[str, Any]] = []

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'replace':
                for l in orig_lines[i1:i2]:
                    changes.append({"type": "removed", "line": l})
                    removed += 1
                for l in mod_lines[j1:j2]:
                    changes.append({"type": "added", "line": l})
                    added += 1
            elif tag == 'delete':
                for l in orig_lines[i1:i2]:
                    changes.append({"type": "removed", "line": l})
                    removed += 1
            elif tag == 'insert':
                for l in mod_lines[j1:j2]:
                    changes.append({"type": "added", "line": l})
                    added += 1
            elif tag == 'equal':
                for l in orig_lines[i1:i2]:
                    changes.append({"type": "context", "line": l})

        return {
            "lines_added": added,
            "lines_removed": removed,
            "net_change": added - removed,
            "changes": changes,
            "unified_diff": DiffEngine.generate_unified_diff(original_code, modified_code)
        }

    @staticmethod
    def apply_search_replace_block(original_code: str, search_block: str, replace_block: str) -> Tuple[bool, str, Optional[str]]:
        """
        Applies a targeted search-and-replace block with multi-tier matching:
        1. Exact match
        2. Normalized whitespace match
        3. Core code line matching (tolerant to docstrings/comments)
        """
        # Tier 1: Exact match
        if search_block in original_code:
            new_code = original_code.replace(search_block, replace_block, 1)
            try:
                ast.parse(new_code)
                return True, new_code, None
            except SyntaxError as e:
                return False, original_code, f"SyntaxError after replacement: {str(e)}"

        # Tier 2: Normalized line matching
        def clean_lines(s: str) -> List[str]:
            return [line.strip() for line in s.splitlines() if line.strip()]

        search_clean = clean_lines(search_block)
        orig_lines = original_code.splitlines()

        if not search_clean:
            return False, original_code, "Empty search block."

        # Find best matching window in orig_lines
        best_start = -1
        best_len = 0

        # Try matching consecutive non-empty lines
        for i in range(len(orig_lines)):
            matched_indices = []
            s_idx = 0
            for j in range(i, min(i + len(search_clean) + 6, len(orig_lines))):
                line_stripped = orig_lines[j].strip()
                if not line_stripped or line_stripped.startswith('"""') or line_stripped.startswith('#'):
                    continue
                if s_idx < len(search_clean) and (line_stripped == search_clean[s_idx] or search_clean[s_idx] in line_stripped):
                    matched_indices.append(j)
                    s_idx += 1
                    if s_idx == len(search_clean):
                        break

            if s_idx == len(search_clean):
                best_start = matched_indices[0]
                best_len = matched_indices[-1] - matched_indices[0] + 1
                break

        if best_start != -1:
            replace_lines = replace_block.splitlines()
            new_lines = orig_lines[:best_start] + replace_lines + orig_lines[best_start + best_len:]
            new_code = "\n".join(new_lines)
            try:
                ast.parse(new_code)
                return True, new_code, None
            except SyntaxError as e:
                return False, original_code, f"SyntaxError after replacement: {str(e)}"

        return False, original_code, "Target search block not found in original code."

    @staticmethod
    def parse_patch_instructions(patch_text: str) -> List[Tuple[str, str]]:
        """
        Parses high-efficiency patch blocks in format:
        <<<<<<< SEARCH
        old_code
        =======
        new_code
        >>>>>>> REPLACE
        """
        pattern = re.compile(r'<{5,}\s*SEARCH\s*\n(.*?)\n={5,}\s*\n(.*?)\n>{5,}\s*REPLACE', re.DOTALL)
        matches = pattern.findall(patch_text)
        return [(m[0], m[1]) for m in matches]

    @staticmethod
    def apply_patch_to_repository(files: Dict[str, str], patch_text: str) -> Tuple[bool, Dict[str, str], Optional[str], Optional[str]]:
        """
        Applies unified patches across a multi-file codebase.
        Matches target files automatically by searching for the target block.
        Returns (success, updated_files_dict, modified_filename, error_message).
        """
        patches = DiffEngine.parse_patch_instructions(patch_text)
        if not patches:
            return False, files, None, "No valid <<<<<<< SEARCH / ======= / >>>>>>> REPLACE patch blocks found."

        updated_files = dict(files)
        modified_file = None

        for search_b, replace_b in patches:
            applied = False
            for fname, code in updated_files.items():
                ok, new_code, err = DiffEngine.apply_search_replace_block(code, search_b, replace_b)
                if ok:
                    updated_files[fname] = new_code
                    modified_file = fname
                    applied = True
                    break

            if not applied:
                return False, files, None, f"Search block could not be located in any repository file."

        return True, updated_files, modified_file, None

