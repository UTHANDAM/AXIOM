"""
Curated realistic benchmark challenges for evaluating agent token efficiency.
Each task includes:
- Task ID & Name
- Category & Problem Description
- Buggy Initial Source Code
- Comprehensive Pytest Test Suite
"""

BENCHMARK_TASKS = {
    "lru_cache": {
        "id": "lru_cache",
        "name": "LRU Cache Recency & Eviction Bug",
        "category": "Systems & Algorithms",
        "description": "Fix LRU Cache implementation where `get` operations fail to update the node's recency status, leading to premature eviction of hot keys.",
        "initial_code": '''class Node:
    def __init__(self, key: int, val: int):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    """
    Least Recently Used (LRU) Cache with capacity constraint.
    Tracks access recency using a doubly-linked list.
    """
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}  # key -> Node
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node):
        prev_node = node.prev
        next_node = node.next
        prev_node.next = next_node
        next_node.prev = prev_node

    def _insert(self, node: Node):
        # Insert right before tail (most recent)
        prev_node = self.tail.prev
        prev_node.next = node
        node.prev = prev_node
        node.next = self.tail
        self.tail.prev = node

    def get(self, key: int) -> int:
        """BUG: Returns val but does not update node to most recent position!"""
        if key in self.cache:
            return self.cache[key].val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._insert(node)
        if len(self.cache) > self.cap:
            # Evict least recently used (node right after head)
            lru = self.head.next
            self._remove(lru)
            del self.cache[lru.key]
''',
        "test_code": '''def test_lru_basic():
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1       # Access key 1 -> 1 should now be most recently used!
    cache.put(3, 3)                # Evicts least recent (should evict 2, NOT 1)
    assert cache.get(2) == -1      # Key 2 must be evicted
    assert cache.get(1) == 1       # Key 1 must still be present!
    assert cache.get(3) == 3

def test_lru_update():
    cache = LRUCache(2)
    cache.put(1, 10)
    cache.put(2, 20)
    cache.put(1, 15)               # Update existing key
    cache.put(3, 30)               # Evicts key 2
    assert cache.get(1) == 15
    assert cache.get(2) == -1
    assert cache.get(3) == 30
'''
    },

    "jwt_validator": {
        "id": "jwt_validator",
        "name": "JWT Token Temporal Expiry & Claim Validator",
        "category": "API Security",
        "description": "Fix JWT token authentication verifier where expiry timestamp comparison is inverted, rejecting active tokens and allowing expired tokens.",
        "initial_code": '''import time
import base64
import json
import hmac
import hashlib

class JWTValidator:
    """Validates simple signed JWT authentication tokens."""
    def __init__(self, secret_key: str):
        self.secret = secret_key.encode('utf-8')

    def sign(self, payload: dict) -> str:
        header = json.dumps({"alg": "HS256", "typ": "JWT"}).encode('utf-8')
        body = json.dumps(payload).encode('utf-8')
        b64_h = base64.urlsafe_b64encode(header).decode('utf-8').rstrip('=')
        b64_b = base64.urlsafe_b64encode(body).decode('utf-8').rstrip('=')
        sig = hmac.new(self.secret, f"{b64_h}.{b64_b}".encode('utf-8'), hashlib.sha256).digest()
        b64_s = base64.urlsafe_b64encode(sig).decode('utf-8').rstrip('=')
        return f"{b64_h}.{b64_b}.{b64_s}"

    def verify(self, token: str) -> dict:
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError("Malformed token")
        h, b, s = parts
        sig = hmac.new(self.secret, f"{h}.{b}".encode('utf-8'), hashlib.sha256).digest()
        expected = base64.urlsafe_b64encode(sig).decode('utf-8').rstrip('=')
        if not hmac.compare_digest(s, expected):
            raise PermissionError("Invalid signature")

        padding = '=' * (-len(b) % 4)
        payload = json.loads(base64.urlsafe_b64decode(b + padding).decode('utf-8'))
        
        # BUG: Condition was inverted (allowed expired tokens)
        if payload.get('exp', 0) <= int(time.time()):
            raise PermissionError("Token expired")

        return payload
''',
        "test_code": '''import time

def test_active_token():
    validator = JWTValidator("super-secret-key")
    token = validator.sign({"user_id": 42, "exp": int(time.time()) + 3600})
    payload = validator.verify(token)
    assert payload["user_id"] == 42

def test_expired_token():
    validator = JWTValidator("super-secret-key")
    token = validator.sign({"user_id": 99, "exp": int(time.time()) - 100})
    import pytest
    with pytest.raises(PermissionError, match="Token expired"):
        validator.verify(token)
'''
    },

    "rate_limiter": {
        "id": "rate_limiter",
        "name": "Sliding-Window Rate Limiter Timestamp Eviction",
        "category": "Distributed Systems",
        "description": "Fix sliding-window rate limiter which fails to purge timestamps older than the rate limit window before evaluating bucket limits.",
        "initial_code": '''import time
from collections import defaultdict

class SlidingWindowRateLimiter:
    """Enforces request rate limits over a sliding time window."""
    def __init__(self, max_requests: int = 5, window_seconds: float = 1.0):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        # BUG: Missing timestamp pruning! Old requests are never purged.
        if len(self.requests[client_id]) >= self.max_requests:
            return False
        self.requests[client_id].append(now)
        return True

    def reset(self, client_id: str):
        self.requests[client_id].clear()
''',
        "test_code": '''import time

def test_rate_limiter_allows_under_limit():
    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=0.1)
    assert limiter.is_allowed("alice") is True
    assert limiter.is_allowed("alice") is True
    assert limiter.is_allowed("alice") is True
    assert limiter.is_allowed("alice") is False  # 4th request in same window blocked

def test_rate_limiter_resets_after_window():
    limiter = SlidingWindowRateLimiter(max_requests=2, window_seconds=0.05)
    assert limiter.is_allowed("bob") is True
    assert limiter.is_allowed("bob") is True
    assert limiter.is_allowed("bob") is False
    time.sleep(0.06)  # Window expires
    assert limiter.is_allowed("bob") is True     # Should be allowed again!
'''
    },

    "distributed_ledger": {
        "id": "distributed_ledger",
        "name": "E-Commerce Ledger & Coupon Stacking Bug (Multi-File Architecture)",
        "category": "Enterprise Microservices",
        "description": "Fix enterprise order processor where discount stacking calculation calculates percentage savings against pre-tax gross rather than discounted subtotal, violating financial reconciliation invariants.",
        "initial_code": '''class OrderItem:
    def __init__(self, item_id: str, unit_price: float, quantity: int):
        self.item_id = item_id
        self.unit_price = unit_price
        self.quantity = quantity

    @property
    def total_cost(self) -> float:
        return self.unit_price * self.quantity

class DiscountEngine:
    """Calculates stacked fixed coupons and percentage VIP tier discounts."""
    def __init__(self, flat_coupon: float = 0.0, vip_discount_pct: float = 0.0):
        self.flat_coupon = flat_coupon
        self.vip_discount_pct = vip_discount_pct

    def compute_final_price(self, gross_subtotal: float) -> float:
        """BUG: vip percentage applies to gross instead of (gross - flat_coupon)!"""
        flat_deduction = min(gross_subtotal, self.flat_coupon)
        pct_deduction = gross_subtotal * (self.vip_discount_pct / 100.0)
        return max(0.0, round(gross_subtotal - flat_deduction - pct_deduction, 2))

class OrderProcessor:
    """Coordinates item pricing and tax calculation across microservices."""
    def __init__(self, discount_engine: DiscountEngine, tax_rate: float = 0.08):
        self.discount_engine = discount_engine
        self.tax_rate = tax_rate

    def checkout(self, items: list[OrderItem]) -> dict:
        gross = sum(i.total_cost for i in items)
        discounted = self.discount_engine.compute_final_price(gross)
        tax = round(discounted * self.tax_rate, 2)
        return {
            "gross": gross,
            "discounted_subtotal": discounted,
            "tax": tax,
            "total": round(discounted + tax, 2)
        }
''',
        "test_code": '''def test_stacked_discount_calculation():
    # Item: 100 gross. Flat coupon: 20. Net before pct is 80.
    # 10% VIP should be 10% of 80 = 8, so final discounted subtotal must be 72.0 (NOT 70.0)!
    engine = DiscountEngine(flat_coupon=20.0, vip_discount_pct=10.0)
    processor = OrderProcessor(engine, tax_rate=0.08)
    items = [OrderItem("SKU-1", 50.0, 2)]
    receipt = processor.checkout(items)
    
    # Invariant: subtotal must be 72.00
    assert receipt["discounted_subtotal"] == 72.00
    assert receipt["tax"] == 5.76
    assert receipt["total"] == 77.76
'''
    }
}

