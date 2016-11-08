from gibolt.backend.utils import counter_initializer


def test_count_at_3():
    """Test initialization at 3"""
    assert counter_initializer(3) != 4
    assert counter_initializer(3) == 3


def test_count_at_wrong_value():
    """Test initialization at a bad value"""
    assert counter_initializer(-10) != -10
    assert counter_initializer(-10) == 10
